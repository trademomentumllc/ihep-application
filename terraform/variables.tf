variable "billing_account" {
  description = "The ID of the billing account to associate projects with"
  type        = string
  default     = "01DFA7-9727C3-119343"
}

variable "org_id" {
  description = "The organization id for the associated resources"
  type        = string
  default     = "579995981844"
}

variable "billing_project" {
  description = "The project id to use for billing"
  type        = string
  default     = "cs-host-953dd88e729f4fd0a661ae"
}

variable "enable_network" {
  description = "Gate resources that depend on shared VPC networking"
  type        = bool
  default     = false
}

variable "folders" {
  description = "Folder structure as a map"
  type        = map
}

variable "application_enabled_folder_paths" {
  description = "The folder paths to enable resource manager capability"
  type        = list
}

variable "cmek_autokey_folders" {
  description = "Folders for CMEK autokey encryption"
  type        = list
}
