$repoUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/"
$modelsDir = "d:\Projects\KYC\frontend\public\models"

if (-Not (Test-Path $modelsDir)) {
    New-Item -ItemType Directory -Force -Path $modelsDir
}

$files = @(
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
)

foreach ($file in $files) {
    $url = $repoUrl + $file
    $outPath = Join-Path $modelsDir $file
    Write-Host "Downloading $file..."
    Invoke-WebRequest -Uri $url -OutFile $outPath
}

Write-Host "All models downloaded successfully!"
