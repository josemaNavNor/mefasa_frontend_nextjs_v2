"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTickets } from "@/hooks/use_tickets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Calendar, User, MapPin, Tag, Download } from "lucide-react";
import { EditTicketDialog } from "@/components/edit-ticket-dialog";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchTicketById, loading, exportToExcel } = useTickets();
  const [ticket, setTicket] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadTicketDetails();
    }
  }, [params.id]);

  const loadTicketDetails = async () => {
    try {
      const ticketData = await fetchTicketById(params.id as string);
      setTicket(ticketData);
    } catch (error) {
      console.error("Error al cargar detalles del ticket:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "destructive";
      case "Media": return "default";
      case "Baja": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Abierto": return "destructive";
      case "En Progreso": return "default";
      case "Cerrado": return "secondary";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No establecida";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Ticket no encontrado
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{ticket.ticket_number}</h1>
            <p className="text-muted-foreground">{ticket.summary}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getPriorityColor(ticket.priority)}>
            {ticket.priority}
          </Badge>
          <Badge variant={getStatusColor(ticket.status)}>
            {ticket.status}
          </Badge>
          <Button onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Ticket
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportToExcel([ticket])}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Información adicional se puede agregar aquí */}
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Información del Ticket */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Usuario Final</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.end_user ? 
                      `${ticket.end_user.name} ${ticket.end_user.last_name}` : 
                      "Sin asignar"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Técnico Asignado</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.technician ? 
                      `${ticket.technician.name} ${ticket.technician.last_name}` : 
                      "Sin asignar"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tipo</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.type?.type_name || "Sin tipo"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ubicación</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.floor?.floor_name || "Sin piso"} - {ticket.area?.area_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha Límite</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.due_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Creado</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(ticket.created_at)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Última actualización</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(ticket.updated_at)}
                </p>
              </div>

              {ticket.assigned_at && (
                <div>
                  <p className="text-sm font-medium">Asignado</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.assigned_at)}
                  </p>
                </div>
              )}

              {ticket.resolved_at && (
                <div>
                  <p className="text-sm font-medium">Resuelto</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.resolved_at)}
                  </p>
                </div>
              )}

              {ticket.closed_at && (
                <div>
                  <p className="text-sm font-medium">Cerrado</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.closed_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo de Edición */}
      <EditTicketDialog
        ticket={ticket}
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            // Recargar los detalles del ticket después de editar
            loadTicketDetails();
          }
        }}
      />
    </div>
  );
}