# Nexus-Sentient-Platform/scripts/data-ingestion/hf_dataset_integrator.py

import os
import json
from datasets import load_dataset  # type: ignore
from loguru import logger  # type: ignore
from pathlib import Path

# === CONFIGURATION ===
HF_DATASET_NAME = "jacob-hugging-face/job-descriptions"
HF_CONTENT_COLUMN = "job_description"
HF_SOURCE_COLUMN = "company_name"
OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "data/processed"
OUTPUT_FILENAME = "hf_job_descriptions_processed.json"

# === FUNCTIONS ===
def fetch_and_transform_hf_dataset(dataset_name: str, content_col: str, source_col: str) -> list[dict]:
    """
    Fetches the dataset from Hugging Face Hub and transforms it into a list of documents.
    
    Args:
        dataset_name (str): Name of the dataset on Hugging Face Hub.
        content_col (str): Column name containing the main text content.
        source_col (str): Column name that can be used as the document source.

    Returns:
        List[dict]: A list of dictionaries representing processed documents.
    """
    try:
        # Load dataset from Hugging Face Hub
        logger.info(f"Fetching dataset '{dataset_name}' from Hugging Face...")
        dataset = load_dataset(dataset_name)
        
        # Ensure dataset is not empty
        if not dataset or len(dataset) == 0:
            raise ValueError(f"Dataset '{dataset_name}' is empty or could not be loaded.")
        
        # Extract relevant columns
        logger.info("Extracting content and source data...")
        documents = []
        for split in dataset.keys():
            for item in dataset[split]:
                content = item.get(content_col)
                source = item.get(source_col)
                
                if content and source:
                    documents.append({
                        "content": content,
                        "source": source
                    })
        
        logger.success(f"Fetched and transformed {len(documents)} documents from dataset.")
        return documents
    
    except Exception as e:
        logger.error(f"Error fetching or transforming dataset: {e}")
        raise


def save_processed_documents(documents: list[dict], output_dir: Path, filename: str):
    """
    Saves the processed documents to a JSON file.
    
    Args:
        documents (list[dict]): List of processed documents.
        output_dir (Path): Directory where the output file will be saved.
        filename (str): Name of the output file.
    """
    try:
        # Ensure output directory exists
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save documents to JSON file
        output_path = output_dir / filename
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(documents, f, ensure_ascii=False, indent=4)
        
        logger.success(f"Saved {len(documents)} documents to {output_path}.")
    
    except Exception as e:
        logger.error(f"Error saving processed documents: {e}")
        raise


# === MAIN EXECUTION ===
if __name__ == "__main__":
    logger.info("Starting HF Dataset Integration Script...")
    
    # Fetch and transform dataset
    try:
        documents = fetch_and_transform_hf_dataset(
            dataset_name=HF_DATASET_NAME,
            content_col=HF_CONTENT_COLUMN,
            source_col=HF_SOURCE_COLUMN
        )
    except Exception as e:
        logger.error(f"Failed to fetch and transform dataset: {e}")
        exit(1)
    
    # Save processed documents
    try:
        save_processed_documents(
            documents=documents,
            output_dir=OUTPUT_DIR,
            filename=OUTPUT_FILENAME
        )
    except Exception as e:
        logger.error(f"Failed to save processed documents: {e}")
        exit(1)
    
    logger.success("HF Dataset Integration Completed Successfully!")