# MCP Tool สำหรับ AI Agent ประมวลผลเอกสาร PDF รูป PNG/JPG สร้าง QR ทำ RAG นับ Token และจัดการไฟล์ในเครื่อง

[![CI](https://github.com/lovecatisgood-sudo/AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability/actions/workflows/ci.yml/badge.svg)](https://github.com/lovecatisgood-sudo/AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md) · [ภาษาไทย](README.th.md) · [คู่มือ AI Agent Skills](SKILLS.th.md) · [Skills guide in English](SKILLS.md) · [ทดลองเครื่องมือเดิมใน Browser](https://www.djai.academy/tools/) · [รายการ MCP Tool](docs/tools.md) · [Roadmap](ROADMAP.md)

หลังจากเราเผยแพร่ชุดเครื่องมือฟรีสำหรับรวม แยก บีบอัด และแปลง PDF, แปลงและลดขนาดรูป PNG/JPG/WebP, OCR ภาษาไทย-อังกฤษ, แปลง DOCX, สร้าง QR Code, นับ Token/เตรียม RAG และจัดการ CSV/JSON/Excel มีหลายคนถามว่า จะให้ AI Agent หรือ Coding Agent เข้าถึงเครื่องมือเหล่านี้และทำงานแทนได้อย่างไร

**DJAI Tools MCP คือคำตอบของเรา** เป็น MCP Server แบบ local-first และ open source ที่เปิดให้ AI Agent เรียกใช้ความสามารถประมวลผลไฟล์ในเครื่องของผู้ใช้ โดยกำหนดโฟลเดอร์ที่อ่านและเขียนได้อย่างชัดเจน ไฟล์ไม่ถูกส่งมาให้ DJAI ประมวลผล และ source file ไม่ถูกเขียนทับเป็นค่าเริ่มต้น

โครงการนี้ออกแบบมาสำหรับ Claude, Codex, Cursor, VS Code Agent และ MCP client อื่น เพื่อเตรียม AI Context, นับ Token, แบ่งข้อความเป็น RAG Chunk, ทำความสะอาด CSV/JSON, สร้างไฟล์ QR และใน release ถัดไปจะเพิ่มการประมวลผล PDF, DOCX, OCR, PNG, JPG, WebP และ Spreadsheet ตามลำดับ

> **ขอบเขต v0.1.0:** ตอนนี้มี MCP Tool ที่ใช้งานและผ่าน test แล้ว 8 รายการ สำหรับ Text, AI Context, RAG, CSV, JSON และ QR ส่วนแปลง PDF, DOCX, OCR, รูป PNG/JPG และ XLSX มีอยู่ในชุดเครื่องมือ Browser เดิมและอยู่ใน Roadmap ของ MCP แต่ยังไม่ใช่คำสั่งที่พร้อมใช้ใน v0.1.0

## ทำไมเราสร้างโครงการนี้

เครื่องมือบน Browser เหมาะกับการที่ผู้ใช้เปิดหน้าเว็บ เลือกไฟล์ และกดประมวลผล ส่วน MCP เหมาะกับ workflow ที่ผู้ใช้บอกเป้าหมายกับ Agent เช่น “ทำความสะอาดข้อมูลชุดนี้แล้วแปลงเป็น JSON” หรือ “เตรียมเอกสารนี้เป็น RAG Knowledge Base” จากนั้น Agent เลือกและเรียก Tool ที่จำเป็นให้

หลักการสำคัญ:

- **ประมวลผลในเครื่อง:** ใช้ compute และ storage ของผู้ใช้
- **รักษาความเป็นส่วนตัว:** ไม่ upload เอกสารไปให้ DJAI
- **จำกัดสิทธิ์ไฟล์:** อ่านและเขียนได้เฉพาะ directory ที่อนุญาต
- **ไม่เขียนทับต้นฉบับ:** ต้องเปิด `--overwrite` โดยตั้งใจเท่านั้น
- **ผลลัพธ์ตรวจสอบได้:** รายงาน path, ขนาด, จำนวนข้อมูล, warning และเวลาประมวลผล
- **เลือก Tool เท่าที่ต้องใช้:** มี profile เล็กเพื่อลด context และลดการเลือก Tool ผิด
- **ฟรีและ Open Source:** ใช้ MIT License นำไปใช้ แก้ไข และพัฒนาต่อได้

## MCP Tool ที่ใช้งานได้ใน v0.1.0

| ความสามารถ | ชื่อ MCP Tool | ผลลัพธ์ |
| --- | --- | --- |
| นับ AI Token | `djai_ai_count_tokens` | นับ Token คำ ตัวอักษร Byte บรรทัด และย่อหน้า |
| ทำความสะอาด AI Context | `djai_ai_optimize_context` | ลด Header ซ้ำ เลขหน้า บรรทัดแตก และช่องว่างเกิน |
| แบ่ง RAG Chunk | `djai_ai_chunk_for_rag` | สร้าง JSONL Chunk ตามจำนวน Token และ Overlap |
| รวมไฟล์เป็น Context | `djai_ai_package_prompt` | รวม Source หลายไฟล์ด้วยขอบเขต Markdown หรือ XML |
| CSV เป็น JSON | `djai_data_csv_to_json` | แปลง CSV ที่มี Header เป็น JSON Array |
| JSON เป็น CSV | `djai_data_json_to_csv` | แปลง Array ของ JSON Object เป็น CSV |
| ทำความสะอาด CSV | `djai_data_clean_csv` | Trim ค่า ลบแถวว่าง และลบแถวซ้ำแบบ Exact Match |
| สร้าง QR SVG | `djai_qr_generate` | สร้างไฟล์ QR Code แบบ SVG จากข้อความ URL หรือข้อมูล Wi-Fi |

Roadmap ถัดไปครอบคลุมรวม/แยก/หมุน/ใส่ลายน้ำ PDF, ดึง Text และ AI Markdown จาก PDF, OCR ภาษาไทย-อังกฤษในเครื่อง, แปลง DOCX, แปลงและบีบอัด PNG/JPG/WebP, PDF เป็นรูป, รูปเป็น PDF และ CSV/XLSX อ่านรายละเอียดใน [ROADMAP.md](ROADMAP.md)

## ตัวอย่างงานที่สั่ง Agent ได้

- “นับ Token ของ Requirement ชุดนี้ แล้วรวมเฉพาะ Source ที่เกี่ยวข้องเป็น Context สำหรับ Codex”
- “ทำความสะอาด CSV ลบแถวซ้ำ แปลงเป็น JSON และรายงานจำนวนแถวก่อนกับหลัง”
- “แบ่งข้อความเอกสารที่ extract แล้วเป็น RAG Chunk ขนาด 700 Token และ Overlap 100 Token”
- “สร้าง QR Code SVG ระดับ Error Correction สูงสำหรับ URL นี้”
- Release ถัดไป: “OCR เอกสารสแกนภาษาไทย ทำความสะอาดข้อความ แล้วเตรียมเป็น RAG Knowledge Base”
- Release ถัดไป: “รวม PDF ใส่เลขหน้า บีบอัดผลลัพธ์ และเก็บไฟล์ต้นฉบับไว้”

## AI Agent Skills ที่ใช้ซ้ำได้

Repository นี้มี Workflow Skill 4 รายการสำหรับสอน Agent ที่รองรับให้เรียก MCP Tool อย่างปลอดภัยและเป็นขั้นตอน ได้แก่ [`document-to-rag`](skills/document-to-rag/SKILL.md), [`agent-context-preparation`](skills/agent-context-preparation/SKILL.md), [`batch-data-cleanup`](skills/batch-data-cleanup/SKILL.md) และ [`private-document-processing`](skills/private-document-processing/SKILL.md)

อ่าน [คู่มือ AI Agent Skills ภาษาไทยฉบับเต็ม](SKILLS.th.md) หรือ [English skills guide](SKILLS.md) เพื่อดูความต่างระหว่าง Skill กับ MCP Tool, วิธีติดตั้งใน Codex, ประโยชน์, Prompt ตัวอย่าง, ข้อจำกัด, วิธีแก้ปัญหา, Privacy Guide และไอเดียทำบทความหรือวิดีโอ

## Privacy และ Security

MCP Server ทำงานผ่าน `stdio` ในเครื่อง ไม่ใช่ API สำหรับ upload ไฟล์

- ค่าเริ่มต้นอ่านได้เฉพาะ current working directory
- ค่าเริ่มต้นเขียนผลลัพธ์ไปที่ `./djai-output`
- ไม่เขียนทับไฟล์เดิมจนกว่าจะเปิด `--overwrite`
- ตรวจ real path และ symlink ก่อนอนุญาต
- จำกัดไฟล์ 25 MB, batch 20 ไฟล์/รวม 50 MB, inline text 100,000 ตัวอักษร และข้อมูล CSV/JSON 100,000 แถว
- ไม่ดึง URL จากภายนอก และไม่สร้าง Shell Command จากข้อความของ Model
- รายงานไฟล์ที่สร้างทุกครั้ง พร้อม `modifiedInput: false`

Process ของ MCP ยังคงมีสิทธิ์ตาม user account ที่ใช้เปิด จึงควรอนุญาตเฉพาะโฟลเดอร์ที่จำเป็นและอ่าน [Security Model](docs/security.md)

## ดาวน์โหลด ติดตั้ง และ Build

ต้องใช้ Node.js 22.13 ขึ้นไปและ npm

```bash
git clone https://github.com/lovecatisgood-sudo/AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability.git
cd AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability
npm ci
npm run build
node dist/index.js --version
```

เปิด MCP Server จาก Source:

```bash
node dist/index.js --profile core \
  --allow-read /absolute/path/to/documents \
  --allow-write /absolute/path/to/djai-output
```

หลังเผยแพร่ npm package แล้ว คำสั่งที่ตั้งใจให้ใช้คือ:

```bash
npx -y @djai/tools-mcp --profile core \
  --allow-read /absolute/path/to/documents \
  --allow-write /absolute/path/to/djai-output
```

## เชื่อมต่อ AI Agent หรือ Coding Agent

สำหรับ Source Checkout ให้ใช้ absolute path ของไฟล์ที่ Build แล้ว:

```json
{
  "mcpServers": {
    "djai-tools": {
      "command": "node",
      "args": [
        "/absolute/path/to/AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability/dist/index.js",
        "--profile",
        "core",
        "--allow-read",
        "/absolute/path/to/documents",
        "--allow-write",
        "/absolute/path/to/djai-output"
      ]
    }
  }
}
```

ควรใช้ absolute path เพราะ Desktop Agent อาจเปิด process จาก directory อื่น ดูตัวอย่าง Claude Desktop, Codex, Cursor และ VS Code ใน [`examples/`](examples/)

## Profile และการเลือก Tool

```bash
node dist/index.js --profile core
node dist/index.js --profile ai-documents
node dist/index.js --profile data
node dist/index.js --profile qr
node dist/index.js --profile full

node dist/index.js --tools ai.count_tokens,ai.chunk_for_rag
```

อ่านรายละเอียดใน [Profiles](docs/profiles.md) และ [Tool Reference](docs/tools.md)

## ชุดเครื่องมือ Browser ต้นทาง

MCP โครงการนี้พัฒนาต่อยอดจาก [ชุดเครื่องมือ PDF รูปภาพ OCR DOCX QR AI และข้อมูลแบบ Open Source](https://github.com/lovecatisgood-sudo/free-pdf-image-ocr-docx-document-converter-qr-code-ai-token-rag-csv-excel-tools) ซึ่งมีเครื่องมือ Browser สำหรับ PDF, แปลง/Resize/บีบอัดรูป, OCR ภาษาไทย-อังกฤษ, เอกสาร, QR, AI Context/RAG, CSV, JSON และ Excel พร้อมใช้งานแล้ว

| ชุดเครื่องมือ | ภาษาไทย | English |
| --- | --- | --- |
| เครื่องมือทั้งหมด | [เปิด](https://www.djai.academy/tools/) | [Open](https://www.djai.academy/tools/en/) |
| PDF | [เปิด](https://www.djai.academy/tools/PDFTools/) | [Open](https://www.djai.academy/tools/PDFTools/en/) |
| รูปภาพ PNG/JPG/WebP | [เปิด](https://www.djai.academy/tools/resizeimg/) | [Open](https://www.djai.academy/tools/resizeimg/en/) |
| เอกสารและ OCR | [เปิด](https://www.djai.academy/tools/document/) | [Open](https://www.djai.academy/tools/document/en/) |
| AI Token และ RAG | [เปิด](https://www.djai.academy/tools/ai/) | [Open](https://www.djai.academy/tools/ai/en/) |
| CSV/JSON/Excel | [เปิด](https://www.djai.academy/tools/spreadsheet/) | [Open](https://www.djai.academy/tools/spreadsheet/en/) |
| QR Code | [เปิด](https://www.djai.academy/tools/qrgen/) | [Open](https://www.djai.academy/tools/qrgen/en/) |

## เกี่ยวกับ DJAI Academy, Siamese Cat Dev และ Siamese Cat Cafe

- [DJAI Academy](https://www.djai.academy/) พัฒนาการเรียนรู้ด้านเทคโนโลยี บริการซอฟต์แวร์ AI Agent Integration และเครื่องมือดิจิทัลฟรีที่นำไปใช้งานจริงได้
- [Siamese Cat Dev](https://www.djai.academy/siamese_cat/dev/) คือนักพัฒนาอิสระและผู้สร้างผลิตภัณฑ์เบื้องหลัง MCP Open Source นี้และชุดเครื่องมือ Browser ต้นทาง
- [Siamese Cat Cafe](https://siamesecat.cafe/) คือธุรกิจชุมชนที่เชื่อมโยงกับโครงการ ช่วยสนับสนุนการรับเลี้ยงแมวและงานสร้างสรรค์ของนักพัฒนาอิสระ ดู [ข้อมูลคาเฟ่บน Google](https://share.google/I0Zp942t2DRuUzrIZ)

การกด Star, Share, Contribution, Feedback, การมาเยี่ยมคาเฟ่ และรีวิวจากประสบการณ์จริง ช่วยสนับสนุนทั้งการพัฒนาซอฟต์แวร์และภารกิจชุมชน

## ติดตาม Siamese Cat Dev

- GitHub: [@lovecatisgood-sudo](https://github.com/lovecatisgood-sudo)
- โปรไฟล์นักพัฒนา: [Siamese Cat Dev](https://www.djai.academy/siamese_cat/dev/)
- X: [@siamesecatdev](https://x.com/siamesecatdev)
- Instagram: [@djcatdev](https://www.instagram.com/djcatdev/)
- Facebook: [Siamese Cat Dev](https://www.facebook.com/people/Siamese-Cat-Dev/61592514145429/)

## การร่วมพัฒนา

```bash
npm run check
npm test
npm run build
npm pack --dry-run
```

ใช้เฉพาะไฟล์ทดสอบสังเคราะห์ ห้าม commit เอกสารส่วนตัว เอกสารลับ ข้อมูลลูกค้า Credential หรือไฟล์ที่ไม่มีสิทธิ์เผยแพร่ อ่าน [CONTRIBUTING.md](CONTRIBUTING.md), [SUPPORT.md](SUPPORT.md), [SECURITY.md](SECURITY.md) และ [Code of Conduct](CODE_OF_CONDUCT.md)

## MIT License และการให้เครดิต

โครงการนี้ฟรีและ Open Source ภายใต้ [MIT License](LICENSE) สามารถใช้ คัดลอก แก้ไข รวม เผยแพร่ แจกจ่าย Sublicense และจำหน่าย รวมถึงใช้ในโครงการเชิงพาณิชย์หรือ Closed Source โดยต้องเก็บ Copyright Notice และข้อความอนุญาตของ MIT ไว้ในสำเนาหรือส่วนสำคัญของซอฟต์แวร์

การให้ Backlink **ไม่ใช่ข้อบังคับของ MIT** แต่เราขอบคุณอย่างยิ่งหากสะดวกให้เครดิต:

- ผู้สร้าง: [Siamese Cat Dev ที่ DJAI Academy](https://www.djai.academy/siamese_cat/dev/)
- ชุดเครื่องมือต้นทาง: [เครื่องมือ PDF รูปภาพ OCR DOCX QR AI และข้อมูล](https://github.com/lovecatisgood-sudo/free-pdf-image-ocr-docx-document-converter-qr-code-ai-token-rag-csv-excel-tools)
- ธุรกิจชุมชน: [Siamese Cat Cafe](https://siamesecat.cafe/)

ดูข้อความเครดิตตัวอย่างใน [ATTRIBUTION.md](ATTRIBUTION.md) ชื่อและเครื่องหมายการค้าไม่ได้อยู่ภายใต้สิทธิ์ของ MIT โปรดอ่าน [TRADEMARKS.md](TRADEMARKS.md)
