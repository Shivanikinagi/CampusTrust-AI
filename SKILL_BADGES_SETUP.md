# Skill Badges - GitHub & PDF Analysis Setup Guide

## Overview
The Skill Badges system now supports:
- ✅ **Real GitHub Repository Analysis** - Fetches actual repo data (stars, forks, languages, files)
- ✅ **PDF Upload & Extraction** - Analyzes uploaded PDF project reports
- ✅ **Enhanced Minting** - Better error handling for blockchain minting
- ✅ **Data Proof Display** - Shows extracted data as proof of analysis

---

## Installation

### 1. Install Python Dependencies

Navigate to the AI engine directory and install the new dependencies:

```bash
cd ai_engine
pip install -r requirements.txt
```

**New dependencies added:**
- `PyPDF2>=3.0.0` - For PDF text extraction
- `requests>=2.31.0` - For GitHub API calls
- `flask-socketio>=5.3.0` - For real-time updates

### 2. Start the AI Backend

```bash
cd ai_engine
python app.py
```

The server will run on `http://localhost:5000`

### 3. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

---

## Features Implemented

### 🔍 GitHub Repository Analysis

**What it does:**
- Fetches real repository data from GitHub API
- Extracts: stars, forks, languages, files, README content
- Analyzes code quality based on actual tech stack
- Displays proof data including detected languages and file structure

**How to use:**
1. Select "GitHub" as project source
2. Enter GitHub repo URL (e.g., `https://github.com/user/repo`)
3. Select skill category
4. Click "Analyze Project"
5. View real extracted data in the analysis results

**Data displayed as proof:**
- Repository name
- Primary language
- Star count ⭐
- Fork count 🍴
- Files detected 📁
- README length 📄
- License ⚖️
- Last update date 🕒
- Tech stack with language breakdown
- Root files list

---

### 📄 PDF Upload & Analysis

**What it does:**
- Accepts PDF file uploads (project reports, documentation)
- Extracts text content using PyPDF2
- Analyzes technical depth, structure, and keywords
- Displays metadata as proof of extraction

**How to use:**
1. Select "PDF Report" as project source
2. Upload your project report (PDF format)
3. Select skill category
4. Click "Analyze Project"
5. View extracted metadata and analysis

**Data displayed as proof:**
- Page count 📄
- Word count 📝
- Character count 📊
- Sections detected 🔍
- Text preview (first 500 chars) 📖
- Keywords extracted 🏷️

**PDF Analysis factors:**
- Document completeness (length, sections)
- Technical depth (methodology, results, conclusion)
- Technology mentions based on category
- Code snippets and examples
- Testing methodology
- Professional structure

---

### 🎖️ Enhanced Minting System

**Improvements:**
1. **Better Error Handling**
   - Clear error messages for insufficient balance
   - Helpful instructions with funding link
   - User rejection detection
   - Timeout handling

2. **Support for Both Sources**
   - Mints badges from GitHub analysis
   - Mints badges from PDF analysis
   - Stores appropriate metadata for each type

3. **Portfolio Display**
   - Different icons for GitHub vs PDF badges
   - Shows relevant metadata for each type
   - Proper tech stack display

---

## API Endpoints

### GitHub Analysis
```http
POST /api/ai/skills/analyze
Content-Type: application/json

{
  "type": "github",
  "url": "https://github.com/user/repo",
  "category": "python",
  "student_wallet": "ALGORAND_ADDRESS"
}
```

**Response:**
```json
{
  "score": 87,
  "level": "Advanced",
  "insights": ["..."],
  "strengths": ["..."],
  "improvements": ["..."],
  "repo_data": {
    "name": "repo-name",
    "stars": 12,
    "forks": 5,
    "language": "Python",
    "languages": {"Python": 50000, "JavaScript": 10000},
    "files": ["README.md", "setup.py", ...],
    "readme": "...",
    "description": "...",
    "license": "MIT",
    "pushed_at": "2026-02-15T10:30:00Z"
  }
}
```

### PDF Analysis
```http
POST /api/ai/skills/analyze-pdf
Content-Type: multipart/form-data

pdf_file: [binary file data]
category: python
student_wallet: ALGORAND_ADDRESS
```

**Response:**
```json
{
  "score": 85,
  "level": "Advanced",
  "insights": ["..."],
  "strengths": ["..."],
  "improvements": ["..."],
  "pdf_metadata": {
    "page_count": 15,
    "word_count": 3500,
    "char_count": 25000,
    "sections_detected": 8,
    "text_preview": "First 500 characters...",
    "keywords": ["python", "machine learning", "tensorflow", ...]
  }
}
```

---

## Troubleshooting

### GitHub API Rate Limiting
- GitHub API allows 60 requests/hour for unauthenticated requests
- If needed, add a GitHub token to increase limit to 5000/hour
- To add token: Set environment variable `GITHUB_TOKEN` in backend

### PDF Extraction Issues
- Ensure PDF is text-based (not scanned images)
- For scanned PDFs, add OCR support (pytesseract + Pillow)
- Large PDFs (>10MB) may take longer to process

### Minting Failures
- **Insufficient Balance**: Fund wallet at https://bank.testnet.algorand.network/
- **Required**: ~0.101 ALGO (0.1 for min balance + 0.001 for fee)
- **Check wallet**: Ensure wallet is connected and on TestNet

### Backend Connection
- Verify AI backend is running on `http://localhost:5000`
- Check console for CORS errors
- Ensure port 5000 is not blocked by firewall

---

## Testing Examples

### Test with GitHub Repos

**Python Project:**
```
https://github.com/pandas-dev/pandas
https://github.com/scikit-learn/scikit-learn
```

**Blockchain Project:**
```
https://github.com/algorand/pyteal
https://github.com/algorand/py-algorand-sdk
```

**Web Project:**
```
https://github.com/facebook/react
https://github.com/vuejs/vue
```

### Test with PDFs
Create a project report PDF with:
- Title page
- Introduction/Abstract
- Methodology/Implementation
- Results/Testing
- Conclusion
- References

Minimum recommended: 5-10 pages, 2000+ words

---

## Code Quality Scoring

### Score Ranges
- **90-98**: Expert - Exceptional implementation
- **80-89**: Advanced - Strong technical skills
- **70-79**: Intermediate - Good fundamentals
- **60-69**: Beginner - Basic understanding

### Scoring Factors (GitHub)
- Primary language match (+10-15 points)
- Framework usage (+8-12 points)
- Stars/Forks (+1-10 points)
- Test coverage (+5 points)
- Documentation (+3-8 points)
- CI/CD setup (+3 points)
- License (+3 points)
- Multi-language (+5 points)

### Scoring Factors (PDF)
- Document length (+4-12 points)
- Section completeness (+6-10 points)
- Technology mentions (+10-12 points)
- Code examples (+5 points)
- Visual aids (+5 points)
- References (+3 points)
- Professional structure (+5 points)

---

## Future Enhancements

### Planned Features
- [ ] GitHub authentication for higher API limits
- [ ] OCR support for scanned PDFs
- [ ] Video project analysis (YouTube links)
- [ ] Jupyter notebook analysis
- [ ] Code quality metrics (complexity, coverage)
- [ ] Plagiarism detection
- [ ] Multi-repository analysis
- [ ] Badge comparison analytics

---

## Support

For issues or questions:
1. Check console logs in browser (F12)
2. Check AI backend logs in terminal
3. Verify network connectivity
4. Ensure all dependencies are installed
5. Review error messages for specific guidance

---

## License

Part of CampusTrust AI Platform - Algorand-based academic credential system
