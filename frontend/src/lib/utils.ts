import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Convert to CSV string
  const csvContent = [
    headers.join(","), // Header row
    ...data.map(row =>
      headers.map(header => {
        const cell = row[header];
        // Handle strings with commas or quotes
        if (typeof cell === 'string') {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(",")
    )
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
