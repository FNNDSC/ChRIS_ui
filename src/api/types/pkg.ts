import type { Datetime } from "./datetime";
import type { ID } from "./id";

// legacy: plugin
export interface Pkg {
  id: ID;
  creation_date: Datetime; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  name: string;
  version: string;
  dock_image: string;
  public_repo: string;
  icon: string;
  type: string;
  stars: number;
  authors: string;
  title: string;
  description: string;
  documentation: string;
  license: string;
  execshell: string;
  selfpath: string;
  selfexec: string;
  min_number_of_workers: number;
  max_number_of_workers: number;
  min_cpu_limit: number;
  max_cpu_limit: number;
  min_memory_limit: number;
  max_memory_limit: number;
  min_gpu_limit: number;
  max_gpu_limit: number;
  category: string;
  url: string;
}
