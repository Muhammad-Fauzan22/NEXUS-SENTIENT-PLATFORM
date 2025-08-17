from datasets import load_dataset
print("Mengunduh Academic Advising dataset...")
ds = load_dataset("TIGER-Lab/Academic-Advising-Dataset")
ds.save_to_disk("./datasets/hf-academic-advising")
print("Dataset advising berhasil disimpan.")

