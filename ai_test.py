import os
import sys
import vertexai
from vertexai.generative_models import GenerativeModel

def run_test():
    try:
        # 1. Dynamically retrieve the active project ID from the gcloud context
        project_id = os.popen("gcloud config get-value project 2>/dev/null").read().strip()
        location = "us-central1"
        
        # Check if project ID was successfully fetched
        if not project_id:
            print("[!] Environment Error: No active Google Cloud project detected.")
            print("    Please run: gcloud config set project YOUR_PROJECT_ID")
            sys.exit(1)
            
        # 2. Define active Gemini 3 generation production string identifiers
        models_to_test = ["gemini-3.5-flash", "gemini-3.1-pro-preview"]
        
        print(f"[*] Starting AI Diagnostic on Project: {project_id}")
        print(f"[*] Region Target: {location}")
        print("-" * 50)
        
        # Initialize the Vertex AI SDK container
        vertexai.init(project=project_id, location=location)
        
        # 3. Iteratively execute inference tests across the model stack
        for model_id in models_to_test:
            print(f"\n[?] Testing Model: {model_id}...")
            try:
                # Instantiate the specific model runtime pointer
                model = GenerativeModel(model_id)
                
                # Execute a lightweight content generation handshake request
                response = model.generate_content("Say 'Hello World' and confirm your engine version.")
                
                print(f"    [+] SUCCESS! AI Response:\n    >>> {response.text.strip()}")
            except Exception as e:
                print(f"    [!] FAILED to execute model endpoint: {str(e)}")
                
    except Exception as env_err:
        print(f"\n[!] Critical Runtime Environment Error: {str(env_err)}")

if __name__ == "__main__":
    run_test()