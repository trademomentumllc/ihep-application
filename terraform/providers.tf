variable "project_id" {
  type    = string
  default = "ihep-app"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "bucket_location" {
  type    = string
  default = "US"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

