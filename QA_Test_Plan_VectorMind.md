# VectorMind — QA Test Plan
**Application Version:** v1.0 (Hybrid RAG + ChatGPT UI)
**Test Suite:** End-to-End Automation & Integration Scenarios

---

## 1. DOCUMENT UPLOAD

**TC01: Upload Valid PDF Document**
* **Steps:** 
  1. Open a new chat session.
  2. Click "Attach PDF".
  3. Select a standard PDF file (< 10MB).
* **Expected Result:** UI state transforms to "Processing Upload...". FastAPI backend returns `200 OK`. The button transforms into a green Checkmark reading `Attached: filename.pdf`.

**TC02: Upload Invalid File Type**
* **Steps:** 
  1. Click "Attach PDF".
  2. Select an image file (`.png`) or a text file (`.txt`).
* **Expected Result:** Upload is rejected immediately. A UI error banner displays: "Only PDF files are supported." Server is not hit.

**TC03: Upload Large File boundary test**
* **Steps:** 
  1. Click "Attach PDF".
  2. Select a PDF exceeding 10MB.
* **Expected Result:** Upload is rejected immediately. A UI error banner displays: "File exceeds 10MB limit."

---

## 2. AUTO SUMMARY

**TC04: Event-Driven Auto Summarization**
* **Steps:** 
  1. Upload a valid document (e.g., `biology_notes.pdf`).
  2. Wait for the upload to complete.
* **Expected Result:** A User message instantly appears saying `Uploaded: biology_notes.pdf`. The `loading` spinner activates automatically. A few seconds later, an Assistant message drops in containing a highly relevant summary of the uploaded document text.

---

## 3. CHAT FUNCTIONALITY

**TC05: Document Context Grounding**
* **Steps:** 
  1. With `biology_notes.pdf` attached, ask a highly specific question guaranteed to exist inside the document (e.g., "What are the three stages of cellular respiration?").
* **Expected Result:** The Assistant returns an accurate answer based purely on the document's content.

**TC06: Citation Presence**
* **Steps:** 
  1. Submit the query from TC05.
  2. Observe the Assistant's response.
* **Expected Result:** The inline answer paragraph should NOT have messy inline markers like `(Page X)`. Instead, an interactive dropdown explicitly labeled "Sources (N)" should appear directly beneath the answer bubble.

---

## 4. HALLUCINATION TEST

**TC07: Guardrail Validation (Out of Context)**
* **Steps:** 
  1. Upload `biology_notes.pdf`.
  2. Ask "What is the capital of France?".
* **Expected Result:** The LLM actively rejects the query and explicitly states that the answer does not exist in the provided context/document.

---

## 5. MULTI-CHAT SYSTEM

**TC08: Cross-Pollination Isolation**
* **Steps:** 
  1. In Chat 1, upload `finance.pdf`. Ask "What is the revenue target?".
  2. Click "New Chat" to spin up Chat 2.
  3. Upload `medical.pdf`. 
  4. Ask "What is the revenue target?".
* **Expected Result:** Chat 1 operates against `finance`. Chat 2 successfully denies the question because the new API routing correctly scopes the backend ChromaDB to only search inside `medical.pdf`.

---

## 6. CHAT SWITCHING

**TC09: DOM Switching & State Recreation**
* **Steps:** 
  1. Execute a heavy conversation in Chat 1.
  2. Open Chat 2, execute a conversation.
  3. Rapidly click between Chat 1 and Chat 2 in the sidebar.
* **Expected Result:** The messages swap instantaneously. The active Sidebar item gets highlighted correctly. The active document checkmark dynamically swaps between the two filenames accurately.

---

## 7. GREETING LOGIC

**TC10: Hooks-Level Greeting Interception**
* **Steps:** 
  1. Open a New Chat.
  2. Verify the initial Assistant message.
  3. Type exactly `hello` and press Enter.
* **Expected Result:** Initial bubble reads: "Hi, how can I help you?". Typing `hello` results in an instantaneous (~400ms) Assistant response: "Hello! How can I assist you with your document?". No network requests are made.

---

## 8. SOURCE DISPLAY

**TC11: Dropdown Source Data Validation**
* **Steps:** 
  1. Trigger an LLM response containing sources.
  2. Click the "Sources (N)" dropdown arrow.
* **Expected Result:** The dropdown expands natively. Each item explicitly lists `Page [X] ([Filename.pdf])`. The text snippet quotes are visibly truncated if longer than 150 characters, followed by `...`.

---

## 9. STATE PERSISTENCE

**TC12: Local Storage Hard Refresh**
* **Steps:** 
  1. Create 3 chats with various messages.
  2. Hard Refresh (CTRL/CMD+R) the browser.
* **Expected Result:** The page loads back to the exact same Active Chat. All 3 chats remain in the Sidebar. All historical message arrays remain structurally intact.

---

## 10. ERROR HANDLING

**TC13: Backend Unreachable**
* **Steps:** 
  1. Shut down the FastAPI server running on `:8000`.
  2. Ask a question.
* **Expected Result:** The loading spinner times out and a red "API Error: Unable to connect to the server..." bubble gracefully renders inside the chat context safely.

**TC14: Empty Query Firing**
* **Steps:** 
  1. Focus the input box.
  2. Enter nothing (or just spaces).
  3. Press Enter.
* **Expected Result:** Send fails. The `sendMessage` hook aborts cleanly. No blank User bubbles are created. No backend calls are dispatched.
