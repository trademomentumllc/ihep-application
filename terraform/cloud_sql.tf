variable "enable_sql" {
  description = "Create Cloud SQL Postgres per workspace with private IP"
  type        = bool
  default     = false
}

# Private service access per workspace (required for private IP)
resource "google_compute_global_address" "sql_private_range" {
  count         = var.enable_sql && var.enable_network ? 1 : 0
  name          = "sql-private-${terraform.workspace}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc[0].self_link
}

resource "google_service_networking_connection" "sql_vpc_connection" {
  count                   = var.enable_sql && var.enable_network ? 1 : 0
  network                 = google_compute_network.vpc[0].self_link
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.sql_private_range[0].name]
  depends_on              = [google_compute_global_address.sql_private_range]
}

resource "google_sql_database_instance" "postgres" {
  count            = var.enable_sql && var.enable_network ? 1 : 0
  name             = "ihep-sql-${terraform.workspace}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-custom-1-3840"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc[0].self_link
    }

    backup_configuration {
      enabled = true
    }
    availability_type           = "ZONAL"
    deletion_protection_enabled = false
  }

  depends_on = [google_service_networking_connection.sql_vpc_connection]
}

output "sql_connection_name" {
  value       = var.enable_sql && var.enable_network ? google_sql_database_instance.postgres[0].connection_name : null
  description = "Cloud SQL connection name (use in Cloud Run connections)"
}

