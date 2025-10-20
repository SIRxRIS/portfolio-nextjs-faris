import { NextResponse } from "next/server";
import { projectsService } from "@/services/firebaseService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    try {
      // Try Firebase first
      const result = await projectsService.getProjectById(id);

      if (result.success && result.data) {
        return NextResponse.json(
          { success: true, data: result.data },
          { status: 200 }
        );
      }
    } catch (firebaseError) {
      console.warn("Firebase error, will try fallback:", firebaseError);
      // Continue to fallback
    }

    // Fallback to local JSON
    try {
      const fs = await import("fs").then((m) => m.promises);
      const path = await import("path");
      const projectsPath = path.join(
        process.cwd(),
        "public",
        "data",
        "project.json"
      );

      const data = await fs.readFile(projectsPath, "utf-8");
      const projects = JSON.parse(data) as Array<{
        id: string;
        [key: string]: unknown;
      }>;
      const foundProject = projects.find((p) => p.id === id);

      if (foundProject) {
        return NextResponse.json(
          { success: true, data: foundProject },
          { status: 200 }
        );
      }
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
    }

    // If both fail, return 404
    return NextResponse.json(
      { success: false, error: "Project not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("API Error fetching project by ID:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch project details",
      },
      { status: 500 }
    );
  }
}
