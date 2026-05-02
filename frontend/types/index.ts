export interface User {
  id: string
  first_name: string
  last_name: string
  phone: string
  email?: string
  role: "admin" | "staff" | "customer"
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  material_type: string
  size: "6mm" | "12mm" | "20mm" | "40mm"
  quantity_tons: number
  delivery_address: string
  status: "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled"
  vehicle_id?: string
  notes?: string
  created_at: string
  delivered_at?: string
}

export interface Vehicle {
  id: string
  vehicle_number: string
  vehicle_type: "tipper" | "lorry"
  capacity_tons: number
  driver_name: string
  driver_phone: string
  status: "available" | "on_trip" | "maintenance"
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}
