# คู่มือ AI Agent Skills ภาษาไทย: เอกสาร Local, RAG, Context, CSV/JSON และความเป็นส่วนตัว

[English](SKILLS.md) · [ภาษาไทย](SKILLS.th.md) · [README ภาษาไทย](README.th.md) · [รายการ MCP Tool](docs/tools.md)

DJAI Tools MCP มี AI Agent Skills แบบฟรีและ Open Source จำนวน 4 Skill สำหรับสร้าง Workflow ประมวลผลเอกสารและข้อมูลในเครื่องอย่างเป็นขั้นตอน ช่วยสอน Agent ให้เตรียมข้อความสำหรับ RAG, รวมไฟล์เป็น Context สำหรับ Coding Agent, ทำความสะอาด CSV/JSON และทำงานกับไฟล์ส่วนตัวโดยไม่เขียนทับต้นฉบับ

คู่มือนี้อธิบายว่า Skill คืออะไร ทำไม Siamese Cat Dev และ DJAI Academy จึงสร้างขึ้น มีประโยชน์อย่างไร ติดตั้ง Skill ใน Codex อย่างไร และควรสั่ง Agent แบบไหน

> **ขอบเขตปัจจุบัน:** Skill ใน v0.1 รองรับ UTF-8 Text, Markdown, CSV, JSON และการสร้าง QR Code แบบ SVG ส่วน PDF, DOCX, OCR, PNG/JPG/WebP, XLSX, Embedding และ Vector Database Indexing อยู่ใน Roadmap ของ MCP และยังไม่ควรอธิบายว่าใช้งานได้แล้ว

## AI Agent Skill คืออะไร?

**MCP Tool** ทำงานเฉพาะอย่าง เช่น นับ Token หรือแปลง CSV เป็น JSON ส่วน **Agent Skill** คือ Workflow ที่ใช้ซ้ำได้ ทำหน้าที่สอน Agent ว่าควรเลือก Tool ใด เรียกตามลำดับไหน ต้องตรวจสอบความปลอดภัยอะไร และควรรายงานผลอย่างไร

| ส่วนประกอบ | หน้าที่ในโครงการ | ตัวอย่าง |
| --- | --- | --- |
| MCP Server | เชื่อม Agent กับความสามารถในเครื่อง | DJAI Tools MCP ทำงานผ่าน `stdio` |
| MCP Tool | ทำงานเฉพาะหนึ่งประเภท | `djai_ai_chunk_for_rag` สร้าง JSONL Chunk |
| Agent Skill | จัดลำดับ Tool และ Quality Check | `document-to-rag` นับ ทำความสะอาด แบ่ง Chunk และรายงาน |
| Prompt ของผู้ใช้ | ระบุเป้าหมายและไฟล์ | “เตรียม Note เป็น RAG Chunk ขนาด 700 Token” |

Skill ไม่ได้ทำหน้าที่แทน MCP Server และไม่ได้แอบ Upload หรือประมวลผลไฟล์เอง ต้องติดตั้ง MCP Server เพื่อให้ Agent มี Tool แล้วติดตั้งโฟลเดอร์ Skill เพื่อให้ Agent ที่รองรับรู้จัก Workflow

## ทำไมเราสร้าง Skills เหล่านี้

การให้รายการ Tool กับ Agent เป็นเพียงจุดเริ่มต้น งานไฟล์ที่เชื่อถือได้ยังต้องมีการตัดสินใจที่ดี เช่น เก็บต้นฉบับไว้ เลือก Profile ที่เล็กที่สุด ไม่ทำความสะอาด Source Code แบบเดียวกับข้อความทั่วไป ตรวจ Parser Warning รายงาน Output Path และไม่เรียกไฟล์ RAG Chunk ว่าเป็น Vector Index ที่เสร็จแล้ว

Skill จึงเก็บแนวทางเหล่านี้ไว้เป็น Workflow เพื่อให้ผู้เริ่มต้นบอกเพียงผลลัพธ์ที่ต้องการ และช่วยให้ผู้ใช้ระดับสูงได้ขั้นตอนที่สม่ำเสมอและตรวจสอบย้อนหลังได้ ประโยชน์หลักคือ:

- **เริ่มใช้งานเร็วขึ้น:** สั่งงานด้วยภาษาธรรมชาติ ไม่ต้องจำ Argument ของทุก Tool
- **ผลลัพธ์สม่ำเสมอ:** มีค่าเริ่มต้นและรูปแบบรายงานที่เปรียบเทียบได้
- **รักษาความเป็นส่วนตัว:** เคารพขอบเขตโฟลเดอร์อ่าน/เขียน และไม่แสดงเนื้อหาที่ไม่จำเป็น
- **รักษาไฟล์ต้นฉบับ:** สร้าง Output แยก เว้นแต่ผู้ใช้อนุญาตให้แทนที่อย่างชัดเจน
- **ลด Context ที่ไม่จำเป็น:** นับ Token และเลือกเฉพาะ Source ที่เกี่ยวข้อง
- **ไม่กล่าวอ้างเกินจริง:** หยุดเมื่อเจอ PDF, OCR, Embedding หรือ Fuzzy Matching ที่ v0.1 ยังไม่รองรับ

## 4 Skills ที่เผยแพร่แล้ว

| Skill | เหมาะกับงาน | MCP Profile | Tool หลัก |
| --- | --- | --- | --- |
| [`document-to-rag`](skills/document-to-rag/SKILL.md) | เปลี่ยน Text/Markdown ที่ Extract แล้วเป็น JSONL Chunk ตาม Token | `ai-documents` | นับ, Optimize, Chunk |
| [`agent-context-preparation`](skills/agent-context-preparation/SKILL.md) | รวม Requirement, Note, Doc หรือ Code สำหรับ AI/Coding Agent | `ai-documents` | นับ, Optimize, Package |
| [`batch-data-cleanup`](skills/batch-data-cleanup/SKILL.md) | ทำความสะอาด UTF-8 CSV และแปลง CSV/JSON แบบ Flat | `data` | Clean CSV, CSV↔JSON |
| [`private-document-processing`](skills/private-document-processing/SKILL.md) | ควบคุมงานไฟล์ Local ด้วยสิทธิ์แคบและรายงานครบ | เลือก Profile ที่แคบที่สุด | Tool v0.1 ที่เปิดใช้งาน |

## ก่อนติดตั้ง Skill

1. ติดตั้งและ Build DJAI Tools MCP ตาม [คู่มือหลัก](README.th.md#ดาวน์โหลด-ติดตั้ง-และ-build)
2. เชื่อม MCP เข้ากับ Agent โดยใช้ตัวอย่างใน [`examples/`](examples/)
3. กำหนด Absolute Path ของ `--allow-read` และ `--allow-write` ให้แคบเท่าที่จำเป็น
4. เลือก Profile ที่แนะนำ หรือใช้ `--tools` เพื่อ Allowlist Tool แบบเจาะจง
5. ทดสอบว่า Client มองเห็น `djai_*` Tool ที่ต้องใช้ก่อนสั่ง Skill

Skill เป็นส่วนเสริม MCP Tool ยังเรียกใช้โดยไม่มี Skill ได้ แต่ Skill ช่วยกำหนดขั้นตอนหลาย Tool ที่เราแนะนำ

## วิธีติดตั้ง Skills ใน Codex

Codex รองรับ Global Skill ที่ `~/.agents/skills` และ Skill เฉพาะ Repository ที่ `.agents/skills` ควรคัดลอก **ทั้งโฟลเดอร์ Skill** ไม่ใช่เฉพาะไฟล์ `SKILL.md`

### วิธี A: ติดตั้งทั้ง 4 Skill สำหรับ User

รันคำสั่งนี้จาก Repository ของ DJAI Tools MCP ที่ Clone แล้ว:

```bash
mkdir -p ~/.agents/skills
cp -R skills/document-to-rag ~/.agents/skills/
cp -R skills/agent-context-preparation ~/.agents/skills/
cp -R skills/batch-data-cleanup ~/.agents/skills/
cp -R skills/private-document-processing ~/.agents/skills/
```

### วิธี B: ติดตั้งเฉพาะ Repository หนึ่ง

รันจาก Project ที่ต้องการให้ Codex ค้นพบ Skill และเปลี่ยน Source Path ให้ตรงกับเครื่อง:

```bash
mkdir -p .agents/skills
cp -R /absolute/path/to/djai-tools-mcp/skills/document-to-rag .agents/skills/
cp -R /absolute/path/to/djai-tools-mcp/skills/agent-context-preparation .agents/skills/
```

หลังติดตั้งให้เปิด Codex Session ใหม่ Codex อาจเลือก Skill อัตโนมัติเมื่อคำขอตรงกับ Description หรือเรียกชื่อ Skill โดยตรงด้วย `$skill-name`

```text
$document-to-rag เตรียม notes.md เป็น JSONL Chunk ขนาด 700 Token และ Overlap 100 Token
```

ตำแหน่งติดตั้งและหลักการค้นพบนี้อ้างอิง [เอกสาร Codex Skills อย่างเป็นทางการ](https://learn.chatgpt.com/docs/customization/overview#skills) ส่วน Agent อื่นอาจใช้ Format หรือ Directory คนละแบบ ให้คงการเชื่อมต่อ MCP ไว้และปรับ Workflow ตามเอกสารของ Client นั้น

## Skill 1: Document to RAG

ใช้ [`document-to-rag`](skills/document-to-rag/SKILL.md) เมื่อมีไฟล์ UTF-8 `.txt` หรือ Markdown แล้ว และต้องการสร้าง JSONL Chunk แบบกำหนดซ้ำได้สำหรับขั้นตอน RAG Ingestion ต่อไป

Workflow นี้จะ:

1. ตรวจประเภทไฟล์และ Allowed Path
2. นับ Token ของต้นฉบับ
3. เลือกลบ Header/Page Label ซ้ำ แก้บรรทัดข้อความที่แตก และลดช่องว่างเกินเมื่อเหมาะสม
4. แบ่ง Chunk ตาม Token โดยค่าเริ่มต้นแนะนำ 700 Token และ Overlap 100 Token
5. รายงาน Output Path, Token รวม, จำนวน Chunk, Setting และ Warning

ตัวอย่าง Prompt:

```text
$document-to-rag เตรียม research-notes.md สำหรับ RAG ใช้ Chunk 700 Token,
Overlap 100 Token, เก็บต้นฉบับ และรายงาน Path ของ JSONL พร้อมสถิติ
```

```text
ใช้ document-to-rag กับ extracted-manual.txt ลบ Header ที่ซ้ำก่อน
แต่ห้ามใช้ Embedding Service และห้าม Upload ข้อความออกไป
```

Output คือ JSONL Chunk ที่พร้อมส่งต่อไปยังระบบ Ingestion แต่ **ยังไม่ใช่** Embedding, Vector Database, Retrieval Service หรือ Chatbot ที่เสร็จแล้ว ใน v0.1 ต้อง Extract ข้อความจาก PDF, DOCX หรือรูปภาพก่อนใช้ Skill นี้

## Skill 2: Agent Context Preparation

ใช้ [`agent-context-preparation`](skills/agent-context-preparation/SKILL.md) เพื่อรวม Requirement, Source Code, Note หรือ Documentation ที่เลือกแล้วเป็น Context Artifact หนึ่งไฟล์สำหรับ AI Agent

Workflow นี้จะ:

1. เลือกไฟล์ UTF-8 ที่เกี่ยวข้อง ไม่เกิน Batch Limit 20 ไฟล์
2. วัดขนาด Input ที่ใหญ่ผิดปกติ
3. ทำความสะอาดเฉพาะ Prose เมื่อเหมาะสม ไม่จัด Format Code ใหม่
4. รวม Source ด้วยขอบเขต Markdown หรือ XML และเก็บชื่อ Source ไว้
5. นับ Token ของ Package สุดท้ายและรายงานรายการที่รวม

ตัวอย่าง Prompt:

```text
$agent-context-preparation รวม REQUIREMENTS.md, src/api.ts และ docs/schema.md
สำหรับ Coding Agent ใช้ XML Boundary และรายงาน Token รวม
```

```text
เตรียม Context แบบกระชับจาก Meeting Note และ Specification เหล่านี้
ไม่รวม Secret, Build Output และไฟล์ที่ไม่เกี่ยวข้อง และห้ามสร้าง Requirement เพิ่มเอง
```

เหมาะกับการส่งต่องานให้ Coding Agent, เตรียม Bug Investigation Packet, Architecture Review, Implementation Brief และลด Token ที่ไม่จำเป็นก่อนเริ่มงาน AI ขนาดใหญ่

## Skill 3: Batch Data Cleanup

ใช้ [`batch-data-cleanup`](skills/batch-data-cleanup/SKILL.md) สำหรับทำความสะอาด UTF-8 CSV และแปลงระหว่าง CSV ที่มี Header กับ JSON ที่เป็น Top-level Array ของ Flat Object

สิ่งที่ทำได้:

- Trim ชื่อ Column และค่าใน CSV
- ลบแถวว่าง
- ลบแถวซ้ำแบบ Exact Match
- แปลง CSV เป็น JSON Array ที่อ่านง่าย
- แปลง Flat JSON Object เป็น CSV สำหรับ Spreadsheet
- รายงานจำนวน Row, Column, รายการที่ลบ, Warning และ Output Path

ตัวอย่าง Prompt:

```text
$batch-data-cleanup ทำความสะอาด customers.csv ลบแถวว่างและแถวซ้ำแบบ Exact,
เขียนเป็นไฟล์ใหม่ แปลงผลลัพธ์เป็น JSON และรายงานจำนวนแถวทุกขั้นตอน
```

```text
แปลง products.json เป็น CSV หากพบ Object หรือ Array ซ้อนกันให้หยุดและอธิบาย
ห้าม Flatten อัตโนมัติ
```

Workflow นี้ไม่ทำ Fuzzy Deduplication, Record Linkage, Type Inference อัตโนมัติ หรือ Flatten Nested JSON โดยไม่บอกผู้ใช้ ค่า CSV ยังคงเป็น String

## Skill 4: Private Document Processing

ใช้ [`private-document-processing`](skills/private-document-processing/SKILL.md) เมื่องานให้ความสำคัญกับ Local Privacy, สิทธิ์ไฟล์ที่แคบ, การเก็บต้นฉบับ และรายงาน Output ที่ครบถ้วน

นี่คือ Oversight Skill สำหรับงานที่ v0.1 รองรับ โดยกำหนดให้ Agent:

- ยืนยัน Input/Output Directory ที่อนุญาต
- เลือก Tool ที่แคบที่สุด แทนการเปิดทุกอย่าง
- เก็บต้นฉบับและไม่ Overwrite โดยอัตโนมัติ
- ตรวจ Success, Warning, Size, Count, Path และ `modifiedInput`
- ไม่แสดงเนื้อหาลับเพียงเพื่อยืนยันว่าทำงานสำเร็จ

ตัวอย่าง Prompt:

```text
$private-document-processing นับ Token ใน private-notes.md และรวมกับ policy.md
ทำงานเฉพาะใน Local Folder ที่กำหนด เก็บต้นฉบับ และรายงาน Output โดยไม่ Quote เนื้อหาลับ
```

```text
ใช้ private-document-processing สร้าง SVG QR Code สำหรับ Wi-Fi Payload นี้
ใน Allowed Output Folder และรายงาน Exact File Path
```

การทำงานในเครื่องช่วยลดการส่งข้อมูลที่ไม่จำเป็น แต่ MCP Process ยังมีสิทธิ์ตาม User Account ที่ใช้เปิด จึงควรกำหนด Root ให้แคบและอ่าน [Security Model](docs/security.md)

## สูตร Workflow ที่นำไปใช้ได้ทันที

### เตรียมเอกสารที่ Extract แล้วสำหรับ Local RAG Pipeline

```text
$document-to-rag ประมวลผล handbook.txt และ faq.md แยกกัน เก็บต้นฉบับ
ใช้ Chunk 700 Token กับ Overlap 100 Token และคืน JSONL Path, Token, Chunk Count และ Warning
```

### ให้ Coding Agent เฉพาะ Context ที่จำเป็น

```text
$agent-context-preparation ตรวจไฟล์ที่ฉันระบุ เลือกเฉพาะข้อมูลที่เกี่ยวข้องกับ Authentication Bug
รวมด้วย XML Source Boundary และบอกว่ารวมกับไม่รวมอะไรบ้าง
```

### ทำความสะอาดข้อมูลก่อนวิเคราะห์หรือ Import เข้า API

```text
$batch-data-cleanup เก็บ sales.csv ต้นฉบับไว้ Trim ค่า ลบแถวว่างและ Exact Duplicate
สร้าง sales-clean.csv กับ sales-clean.json แล้วเปรียบเทียบจำนวนแถว
```

### รวมกฎ Privacy เข้ากับ Workflow เฉพาะทาง

```text
ใช้ $private-document-processing และ $document-to-rag ทำงานทั้งหมดในเครื่อง
เตรียม notes.txt เป็น RAG JSONL ห้ามเขียนทับ และห้ามพิมพ์เนื้อหาเอกสารในรายงานจบงาน
```

## แก้ปัญหาเบื้องต้น

**Agent เห็น Skill แต่ไม่เห็น `djai_*` Tool:** ติดตั้ง Skill แล้ว แต่ยังไม่ได้เชื่อม MCP Server หรือ Profile ไม่เปิด Tool ที่ต้องใช้ ให้ตรวจ Config ของ Client และ [Profiles](docs/profiles.md)

**Agent เห็น MCP Tool แต่ไม่เลือก Skill:** เรียกชื่อโดยตรง เช่น `$batch-data-cleanup` และเปิด Session ใหม่หลังติดตั้งหรือแก้ไข Skill

**Server ปฏิเสธ Path:** ใช้ Absolute Path และตรวจว่า Source อยู่ใต้ `--allow-read` ส่วนปลายทางอยู่ใต้ `--allow-write` ห้ามใช้ Symlink เพื่อหลบข้อจำกัด

**งาน PDF, รูปภาพ, DOCX หรือ XLSX หยุด:** เป็นพฤติกรรมที่ถูกต้องของ v0.1 ตอนนี้ใช้ UTF-8 Text ที่ Extract แล้วสำหรับ RAG หรือดู [Roadmap](ROADMAP.md) สำหรับ Native Format

**JSONL ยัง Search ไม่ได้:** การแบ่ง Chunk เป็นเพียงการเตรียม Record ต้องเลือกระบบ Embedding และ Vector Index แยกต่างหากจึงจะทำ Semantic Retrieval ได้

## ไอเดียทำ Content, บทความ และวิดีโอ

ผู้สร้าง Content, ครู และ Community สามารถใช้หัวข้อที่ค้นหาเจอง่ายเหล่านี้เพื่อสาธิตโครงการ:

- สร้าง Local Document to RAG Workflow ด้วย AI Agent และ MCP
- วิธีติดตั้ง AI Agent Skill ใน Codex และเชื่อมกับ MCP Tool
- ประมวลผลเอกสารส่วนตัวด้วย AI โดยไม่ Upload ไฟล์ไปเว็บไซต์ภายนอก
- วิธีรวม Source Code และ Requirement โดยไม่เปลือง AI Context Token
- ทำความสะอาด CSV และแปลง CSV เป็น JSON ด้วย AI Agent ในเครื่อง
- MCP Tool กับ Agent Skill ต่างกันอย่างไร
- ระบบเอกสารภาษาไทย-อังกฤษสำหรับธุรกิจขนาดเล็ก Developer และผู้สอน

เมื่อทำ Content ควรระบุขอบเขตของ Release ปัจจุบันให้ชัด และ Link มาที่ Repository นี้เพื่อให้ผู้ชมได้รับ Setup และ Security Note เวอร์ชันล่าสุด

## ใครได้ประโยชน์จาก Skills เหล่านี้?

- Developer ที่เตรียม Context แบบกระชับให้ Codex หรือ Coding Agent อื่น
- ผู้เรียน AI/RAG ที่ต้องการ Text Chunk แบบโปร่งใสและทำซ้ำได้
- Data Analyst ที่ทำความสะอาด CSV/JSON ทั่วไปก่อน Import
- ธุรกิจขนาดเล็กและผู้สอนที่ทำงานกับข้อมูลภาษาไทยหรืออังกฤษในเครื่อง
- ผู้ใช้ที่ใส่ใจ Privacy และต้องการ Agent Automation โดยไม่มี DJAI-hosted Upload Service
- Content Creator ที่สอน MCP และ AI Agent Workflow แบบนำไปใช้จริง

## เครดิตและ Open-source License

Skills และ DJAI Tools MCP สร้างโดย [Siamese Cat Dev](https://www.djai.academy/siamese_cat/dev/) ที่ [DJAI Academy](https://www.djai.academy/) และพัฒนาต่อยอดจาก [ชุดเครื่องมือ Browser ฟรีสำหรับ PDF, รูปภาพ, OCR, DOCX, QR, AI และข้อมูล](https://github.com/lovecatisgood-sudo/free-pdf-image-ocr-docx-document-converter-qr-code-ai-token-rag-csv-excel-tools)

[Siamese Cat Cafe](https://siamesecat.cafe/) คือธุรกิจชุมชนที่เชื่อมโยงกับโครงการ ช่วยสนับสนุนการรับเลี้ยงแมวและงานสร้างสรรค์ของนักพัฒนาอิสระ การกด Star, Contribution, ทำ Tutorial อย่างรับผิดชอบ, มาเยี่ยมคาเฟ่ และรีวิวจากประสบการณ์จริงช่วยสนับสนุนภารกิจโดยรวม

Code และ Skills เป็น Free Open Source ภายใต้ [MIT License](LICENSE) การให้เครดิตเป็นสิ่งที่เราขอบคุณ แต่ไม่ใช่ข้อบังคับนอกเหนือจากการเก็บ MIT Notice ตามเงื่อนไข License ดูข้อความเครดิตพร้อมใช้ใน [ATTRIBUTION.md](ATTRIBUTION.md)
