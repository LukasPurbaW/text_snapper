##app_data_structure
/app
├── main.py                # FastAPI backend
├── requirements.txt       
├── /src
│     ├── dummy_web_creator/
│     ├── screenshoter/
│     ├── video_creator/
│     ├── utils/
│     └── models/
├── /storage               # All generated files (not part of the repo)
│     ├── users/
│     └── temp/
├── /frontend               # All generated files (not part of the repo)
│     ├── app/
│     └── component/

##app_src_structure
src/
├── p01_dummy_pages_generator/
│     ├── generator.py
│     └── templates/
│     └── unsplash_images/
│
├── screenshoter/
│     ├── capture.py
│     └── playwright/
│
├── video_creator/
│     ├── composer.py
│     ├── audio/
│     └── ffmpeg/
│
└── utils/
      ├── file_utils.py
      ├── job_utils.py
      ├── id_generator.py
      ├── user_manager.py
      └── cleanup.py