import re

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)
    text = re.sub(r'[\uE000-\uF8FF]', '', text)
    text = "\n".join([line.strip() for line in text.split('\n') if line.strip()])
    return text

def contains_keywords(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)
