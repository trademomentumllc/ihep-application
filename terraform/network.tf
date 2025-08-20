resource "google_compute_network" "vpc" {
  count                   = var.enable_network ? 1 : 0
  name                    = "ihep-app-${terraform.workspace}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  count         = var.enable_network ? 1 : 0
  name          = "ihep-app-${terraform.workspace}-subnet"
  ip_cidr_range = "10.10.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc[0].self_link
}

