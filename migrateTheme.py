import os
import re

# === CONFIGURATION ===

# Map old Tailwind color classes to new ones
# key: old class, value: new class
color_mapping = {
    # Neutral / Background
    "bg-light": "bg-bg-primary-light",
    "bg-dark": "bg-bg-primary-dark",
    "bg-surface-light": "bg-bg-surface-light",
    "bg-surface-dark": "bg-bg-surface-dark",

    "text-light": "text-bg-primary-light",
    "text-dark": "text-bg-primary-dark",
    "text-surface-light": "text-bg-surface-light",
    "text-surface-dark": "text-bg-surface-dark",

    # Primary / Secondary / Accent
    "text-primary-light": "text-text-default-light",
    "text-primary-dark": "text-text-default-dark",
    "text-secondary-light": "text-text-secondary-light",
    "text-secondary-dark": "text-text-secondary-dark",
    "text-accent-light": "text-text-accent-light",
    "text-accent-dark": "text-text-accent-dark",

    "bg-primary-light": "bg-text-default-light",
    "bg-primary-dark": "bg-text-default-dark",
    "bg-secondary-light": "bg-text-secondary-light",
    "bg-secondary-dark": "bg-text-secondary-dark",
    "bg-accent-light": "bg-text-accent-light",
    "bg-accent-dark": "bg-text-accent-dark",

    # Brand Colors
    "text-brand-light": "text-brand-primary-light",
    "text-brand-dark": "text-brand-primary-dark",
    "bg-brand-light": "bg-brand-primary-light",
    "bg-brand-dark": "bg-brand-primary-dark",
    "hover:text-brand-light": "hover:text-brand-hover-light",
    "hover:text-brand-dark": "hover:text-brand-hover-dark",
    "hover:bg-brand-light": "hover:bg-brand-hover-light",
    "hover:bg-brand-dark": "hover:bg-brand-hover-dark",
    "border-brand-light": "border-brand-border-light",
    "border-brand-dark": "border-brand-border-dark",

    # Status Colors
    "text-good": "text-status-success",
    "text-bad": "text-status-error",
    "text-warning": "text-status-warning",
    "text-info": "text-status-info",
    "bg-good": "bg-status-success",
    "bg-bad": "bg-status-error",
    "bg-warning": "bg-status-warning",
    "bg-info": "bg-status-info",

    # Border Colors
    "border-light": "border-border-default-light",
    "border-dark": "border-border-default-dark",
    "border-muted-light": "border-border-muted-light",
    "border-muted-dark": "border-border-muted-dark",

    # Hover / Focus / Active
    "hover:text-primary-light": "hover:text-hover-primary-light",
    "hover:text-primary-dark": "hover:text-hover-primary-dark",
    "hover:text-secondary-light": "hover:text-hover-secondary-light",
    "hover:text-secondary-dark": "hover:text-hover-secondary-dark",
    "hover:bg-primary-light": "hover:bg-hover-primary-light",
    "hover:bg-primary-dark": "hover:bg-hover-primary-dark",
    "hover:bg-secondary-light": "hover:bg-hover-secondary-light",
    "hover:bg-secondary-dark": "hover:bg-hover-secondary-dark",

    # Focus ring
    "focus:ring-light": "focus:ring-focus-ring-light",
    "focus:ring-dark": "focus:ring-focus-ring-dark",

    # Disabled / Links
    "text-disabled-light": "text-disabled-light",
    "text-disabled-dark": "text-disabled-dark",
    "bg-disabled-light": "bg-disabled-light",
    "bg-disabled-dark": "bg-disabled-dark",
    "text-link-light": "text-link-light",
    "text-link-dark": "text-link-dark",
    "hover:text-link-light": "hover:text-link-hover-light",
    "hover:text-link-dark": "hover:text-link-hover-dark",

    # Shadows
    "shadow-light": "shadow-shadow-light",
    "shadow-dark": "shadow-shadow-dark",
}


# Directory to scan
root_dir = "./src"  # Adjust as needed

# File extension to process
file_extension = ".tsx"


# === FUNCTIONS ===
def replace_colors_in_file(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content

    # Replace all occurrences
    for old_class, new_class in color_mapping.items():
        # Replace only exact Tailwind classes (avoid partial matches)
        pattern = r"\b{}\b".format(re.escape(old_class))
        content = re.sub(pattern, new_class, content)

    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file_path}")


def process_directory(directory: str):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(file_extension):
                replace_colors_in_file(os.path.join(root, file))


# === RUN ===
if __name__ == "__main__":
    process_directory(root_dir)
    print("Theme transition completed.")
