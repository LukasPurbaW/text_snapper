import subprocess
import os

def compile_snapshots_to_video(
    snapshot_folder: str,
    output_video: str = "final_video.mp4",
    snap_sound: str = "camera_shutter.mp3",
    duration: float = 0.2,
    temp_dir: str = "temp_video"
):
    """
    Create a video from PNG snapshots in snapshot_folder.
    Each snapshot is shown for `duration` seconds with a camera shutter sound.
    """

    os.makedirs(temp_dir, exist_ok=True)

    # Get all PNG files
    image_files = sorted(
        [f for f in os.listdir(snapshot_folder) if f.lower().endswith(".png")]
    )

    if not image_files:
        raise RuntimeError("No PNG snapshots found to compile!")

    segment_paths = []

    # Create a small video segment for each image
    for i, img in enumerate(image_files):
        img_path = os.path.join(snapshot_folder, img)
        seg_path = os.path.join(temp_dir, f"seg_{i}.mp4")
        segment_paths.append(seg_path)

        cmd = [
            "ffmpeg",
            "-y",
            "-loop", "1",
            "-t", str(duration),
            "-i", img_path,
            "-i", snap_sound,
            "-c:v", "libx264",
            "-preset", "slow",
            "-crf", "15",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-shortest",
            seg_path
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Concat list
    concat_path = os.path.join(temp_dir, "list.txt")
    with open(concat_path, "w") as f:
        for seg in segment_paths:
            f.write(f"file '{os.path.abspath(seg)}'\n")

    # Final concatenation
    cmd_concat = [
        "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_path,
        "-c", "copy",
        output_video
    ]
    subprocess.run(cmd_concat, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    return output_video
