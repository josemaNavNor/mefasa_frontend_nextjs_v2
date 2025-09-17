"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTickets } from "@/hooks/use_tickets";
import { useUsers } from "@/hooks/useUsersAdmin";
import { useType } from "@/hooks/use_typeTickets";
import { useAreas } from "@/hooks/useAreas";
import { useFloors } from "@/hooks/useFloors";

interface EditTicketDialogProps {
  ticket: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTicketDialog({ ticket, open, onOpenChange }: EditTicketDialogProps) {
  const { updateTicket, loading } = useTickets();
  const { users } = useUsers();
  const { types } = useType();
  const { areas } = useAreas();
  const { floors } = useFloors();

  // Estados del formulario
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    technician_id: "0",
    type_id: "0",
    priority: "",
    status: "",
    floor_id: "0",
    area_id: "0",
    due_date: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Llenar formulario cuando cambie el ticket
  useEffect(() => {
    if (ticket) {
      setFormData({
        summary: ticket.summary || "",
        description: ticket.description || "",
        technician_id: ticket.technician_id?.toString() || "0",
        type_id: ticket.type_id?.toString() || "0",
        priority: ticket.priority || "",
        status: ticket.status || "",
        floor_id: ticket.floor_id?.toString() || "0",
        area_id: ticket.area_id?.toString() || "0",
        due_date: ticket.due_date ? new Date(ticket.due_date).toISOString().split('T')[0] : ""
      });
      setErrors({});
    }
  }, [ticket]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.summary.trim()) {
      newErrors.summary = "El título es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const updateData: any = {
      summary: formData.summary,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      due_date: formData.due_date || undefined
    };

    // Solo incluir campos con valores válidos
    if (formData.technician_id && formData.technician_id !== "0") {
      updateData.technician_id = parseInt(formData.technician_id);
    } else {
      updateData.technician_id = null;
    }
    
    if (formData.type_id && formData.type_id !== "0") {
      updateData.type_id = parseInt(formData.type_id);
    } else {
      updateData.type_id = null;
    }
    
    if (formData.floor_id && formData.floor_id !== "0") {
      updateData.floor_id = parseInt(formData.floor_id);
    } else {
      updateData.floor_id = null;
    }
    
    if (formData.area_id && formData.area_id !== "0") {
      updateData.area_id = parseInt(formData.area_id);
    } else {
      updateData.area_id = null;
    }

    const result = await updateTicket(ticket.id, updateData);
    
    if (result) {
      onOpenChange(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Filtrar soporte (usuarios con rol de técnico o administrador)
  const supportUsers = users.filter(user => {
    // Verificar si tiene el campo role (singular) o roles (plural)
    const userRole = user.role || user.roles?.[0];
    
    if (!userRole) return false;
    
    // El campo en la base de datos es 'rol_name', no 'role_name'
    const roleName = (userRole.rol_name || userRole.role_name || '').toLowerCase().trim();
    
    return roleName.includes('tecnico') || 
           roleName.includes('administrador') ||
           roleName.includes('admin') ||
           roleName.includes('soporte');
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Ticket {ticket?.ticket_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="summary">Título *</Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              placeholder="Título del ticket"
            />
            {errors.summary && (
              <p className="text-sm text-red-500 mt-1">{errors.summary}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descripción detallada del ticket"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Técnico */}
            <div>
              <Label htmlFor="technician">Técnico Asignado</Label>
              <Select
                value={formData.technician_id}
                onValueChange={(value) => handleChange("technician_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin asignar</SelectItem>
                  {supportUsers.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id.toString()}>
                      {technician.name} {technician.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type_id}
                onValueChange={(value) => handleChange("type_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prioridad */}
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baja">Baja</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Abierto">Abierto</SelectItem>
                  <SelectItem value="En Progreso">En Progreso</SelectItem>
                  <SelectItem value="Cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Planta */}
            <div>
              <Label htmlFor="floor">Planta</Label>
              <Select
                value={formData.floor_id}
                onValueChange={(value) => handleChange("floor_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar planta" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor.id} value={floor.id.toString()}>
                      {floor.floor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Área */}
            <div>
              <Label htmlFor="area">Área</Label>
              <Select
                value={formData.area_id}
                onValueChange={(value) => handleChange("area_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.area_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fecha límite */}
          <div>
            <Label htmlFor="due_date">Fecha Límite</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleChange("due_date", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}