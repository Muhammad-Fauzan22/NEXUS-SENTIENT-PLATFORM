from datasets import load_dataset
print("Mengunduh dataset resume...")
ds = load_dataset("finetune/resume-entities-for-ner")
ds.save_to_disk("./datasets/hf-resume-ner")
print("Dataset resume berhasil disimpan.")

