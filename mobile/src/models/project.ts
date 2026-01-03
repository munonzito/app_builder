export interface Project {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  code?: string;
  previewUrl?: string;
  dependencies: string[];
}

export function projectFromJson(json: Record<string, any>): Project {
  return {
    id: json.id,
    userId: json.userId,
    name: json.name,
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
    code: json.code,
    previewUrl: json.previewUrl,
    dependencies: json.dependencies || [],
  };
}

export function projectToJson(project: Project): Record<string, any> {
  return {
    id: project.id,
    userId: project.userId,
    name: project.name,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    code: project.code,
    previewUrl: project.previewUrl,
    dependencies: project.dependencies,
  };
}
