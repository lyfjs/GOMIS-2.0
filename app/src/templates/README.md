# Certificate Templates

This folder contains Word document templates used for generating certificates and forms.

## Available Templates

### 1. Good Moral Certificate (`template.docx`)
### 2. Dropping Form (`dropping-template.docx`)

## How to Generate Templates

### Method 1: Generate from Settings (Recommended)

1. Navigate to **Settings** in the sidebar
2. Scroll to the **Certificate Templates** section
3. Click the appropriate "Generate Template" button
4. Save the downloaded file to this `/templates/` folder

### Method 2: Create Manually in Microsoft Word

1. Create a new Word document
2. Add the content with placeholders in curly braces `{placeholder}`
3. Save with the appropriate filename in this folder

## Good Moral Certificate Template

### Placeholders:
- `{studentName}` - Student's full name
- `{withLRN}` - LRN text (optional, controlled by checkbox)
- `{schoolYear}` - School year (e.g., "2024-2025")
- `{trackAndStrand}` - Track/Strand code (e.g., "ABM", "STEM")
- `{specialization}` - Full specialization name
- `{purpose}` - Purpose of certificate
- `{dateGiven}` - Date in "17th of October 2025" format
- `{signerName}` - Name of certificate signer
- `{signerPosition}` - Position of signer

### Example:
```
TO WHOM IT MAY CONCERN:

This is to certify that {studentName}{withLRN} is currently enrolled for the school year {schoolYear} in this learning institution, as per records on file in this office under {trackAndStrand} specialized in {specialization}.

This further certifies that he/she was a person of good character, and he/she has not violated any of the school rules and regulations. He/she was also cleared of all property responsibility and can get along well with others.

This certification is being issued upon the request of above-mentioned student for {purpose}.

Given this {dateGiven} at Luis Y. Ferrer Jr Senior High School.




{signerName}
{signerPosition}
```

## Dropping Form Template

### Placeholders:
- `{schoolYear}` - School year
- `{semester}` - Semester (1st or 2nd)
- `{date}` - Form date (MM/DD/YYYY)
- `{name}` - Student name
- `{trackAndStrand}` - Track/Strand
- `{specialization}` - Specialization
- `{adviser}` - Adviser name
- `{gradeAndSection}` - Grade and section
- `{inclusive}` - Inclusive dates of absences
- `{actionTaken}` - Actions taken
- `{reasonForDropping}` - Reason for dropping
- `{effectiveDate}` - Effective date
- `{signerName}` - Guidance designate name

### Example Format:
```
Republic of the Philippines
Department of Education

Region IV-A CALABARZON
DIVISION OF GENERAL TRIAS CITY
LUIS Y. FERRER JR. SENIOR HIGH SCHOOL
SOUTH SQUARE VILLAGE, PASONG KAWAYAN II, GEN. TRIAS CITY, CAVITE

DROPPING FORM

S.Y. {schoolYear} / {semester}
DATE: {date}

NAME OF STUDENT: {name}
TRACK/STRAND SPECIALIZATION: {trackAndStrand} - {specialization}
ADVISER: {adviser}
GRADE/SECTION: {gradeAndSection}

INCLUSIVE DATE OF ABSENCES: {inclusive}
ACTION TAKEN: {actionTaken}
REASON FOR DROPPING: {reasonForDropping}
EFFECTIVE DATE: {effectiveDate}

[Signature lines for Student, Adviser, Parent/Guardian, Guidance Designate, School Principal II]
```

## Customizing Templates

You can customize templates in Microsoft Word:

1. Open the template file in Word
2. Modify layout, fonts, spacing, and formatting
3. **Keep placeholders intact** - they must remain as `{placeholder}`
4. Add logos, letterheads, or branding
5. Save the file

The formatting and layout you set will be preserved in generated documents.

## Important Notes

- **Placeholder names are case-sensitive**
- Keep placeholders in curly braces: `{placeholder}`
- Save files with correct names:
  - `template.docx` for Good Moral Certificate
  - `dropping-template.docx` for Dropping Form
- Date formatting is automatic for Good Moral certificates
