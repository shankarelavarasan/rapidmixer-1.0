import sys
import os
import librosa
import soundfile as sf
import numpy as np
from spleeter.separator import Separator
import json
import traceback
from pathlib import Path

def main():
    if len(sys.argv) != 4:
        print("Usage: python process_audio.py <audio_file_path> <output_directory> <process_id>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    output_dir = sys.argv[2]
    process_id = sys.argv[3]
    
    if not os.path.exists(audio_file):
        print(f"Error: Audio file '{audio_file}' not found.")
        sys.exit(1)
    
    try:
        print(f"Starting Spleeter processing for file: {audio_file}")
        print(f"Process ID: {process_id}")
        print(f"Output directory: {output_dir}")
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize Spleeter with 5stems model for high-quality separation
        print("Initializing Spleeter with 5stems-16kHz model...")
        separator = Separator('spleeter:5stems-16kHz')
        
        # Load and preprocess audio for optimal quality
        print("Loading audio file...")
        audio, sample_rate = librosa.load(audio_file, sr=None, mono=False)
        
        # Ensure stereo format for better separation
        if audio.ndim == 1:
            audio = np.stack([audio, audio])
        elif audio.ndim == 2 and audio.shape[0] > 2:
            audio = audio[:2]  # Take first 2 channels
        
        print(f"Audio loaded: {audio.shape}, Sample rate: {sample_rate}")
        
        # Perform separation
        print("Starting stem separation...")
        waveform = audio.T  # Transpose for spleeter format
        prediction = separator.separate(waveform)
        
        # Save each stem with high quality
        stem_files = {}
        quality_params = {
            'samplerate': sample_rate,
            'subtype': 'PCM_24'  # 24-bit for high quality
        }
        
        for stem_name, stem_audio in prediction.items():
            # Clean stem name for filename
            clean_name = stem_name.replace('/', '_').replace('\\', '_')
            output_filename = f"{process_id}_{clean_name}.wav"
            output_path = os.path.join(output_dir, output_filename)
            
            print(f"Saving {stem_name} to {output_path}")
            
            # Normalize audio to prevent clipping while maintaining quality
            normalized_audio = stem_audio / np.max(np.abs(stem_audio)) * 0.95
            
            # Save with high quality settings
            sf.write(output_path, normalized_audio, **quality_params)
            
            stem_files[clean_name] = output_path
            print(f"✓ {stem_name} saved successfully")
        
        # Create metadata file
        metadata = {
            'process_id': process_id,
            'original_file': audio_file,
            'sample_rate': int(sample_rate),
            'duration': float(len(audio[0]) / sample_rate),
            'stems': stem_files,
            'quality': '24-bit/high',
            'model': '5stems-16kHz',
            'status': 'completed'
        }
        
        metadata_path = os.path.join(output_dir, f"{process_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("\n🎵 Spleeter processing completed successfully!")
        print(f"📁 Output directory: {output_dir}")
        print(f"📊 Metadata saved: {metadata_path}")
        print(f"🎼 Stems created: {list(stem_files.keys())}")
        
        # Output final status for Node.js
        print(f"SPLEETER_SUCCESS:{process_id}")
        
    except Exception as e:
        error_msg = f"Error during Spleeter processing: {str(e)}"
        print(error_msg)
        print(f"Traceback: {traceback.format_exc()}")
        
        # Create error metadata
        error_metadata = {
            'process_id': process_id,
            'status': 'failed',
            'error': error_msg,
            'traceback': traceback.format_exc()
        }
        
        try:
            error_path = os.path.join(output_dir, f"{process_id}_error.json")
            with open(error_path, 'w') as f:
                json.dump(error_metadata, f, indent=2)
        except:
            pass
        
        print(f"SPLEETER_ERROR:{process_id}")
        sys.exit(1)

if __name__ == "__main__":
    main()