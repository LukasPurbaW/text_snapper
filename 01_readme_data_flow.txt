(user request)
     ↓
create job_id
     ↓
jobs/<job_id>/input/   ← store request info
     ↓
generate dummy pages
     ↓
jobs/<job_id>/dummy_pages/*.html
     ↓
take screenshots (high-res + cropped)
     ↓
jobs/<job_id>/screenshots/*.png
     ↓
combine into video with snap noise
     ↓
jobs/<job_id>/video/final.mp4
     ↓
copy final.mp4 to storage/users/<user_id>/outputs/
     ↓
DELETE jobs/<job_id>/
     ↓
return final download link