export interface GenerationResult {
  user_id: string;
  keyword: string;
  use_varied_fonts: boolean;
  generated_html: string[];
  generated_snapshots: string[];
  html_count: number;
  snapshot_count: number;
  pages_dir: string;
  snapshots_dir: string;
  images_dir: string;
  video_dir: string;
}