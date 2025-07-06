document.addEventListener('DOMContentLoaded', () => { 
   const templateUpload = document.getElementById('template-upload'); 
   const folderUpload = document.getElementById('folder-upload'); 
   const resultArea = document.getElementById('result-area'); 
   const promptInput = document.getElementById('prompt-input'); 
   const sendPromptBtn = document.getElementById('send-prompt'); 
   const processBtn = document.querySelector('.primary-btn'); 
   const exportBtn = document.getElementById('export-btn');
   const voiceToTextBtn = document.getElementById('voice-to-text-btn');
   const outputText = document.getElementById('outputText'); 

   let templateFile = null; 
   let documentFiles = []; 

   templateUpload.addEventListener('change', (event) => { 
     templateFile = event.target.files[0]; 
     if (templateFile) { 
       resultArea.innerHTML += `<p>Template selected: ${templateFile.name}</p>`; 
     } 
   }); 

   folderUpload.addEventListener('change', (event) => { 
     documentFiles = Array.from(event.target.files); 
     if (documentFiles.length > 0) { 
       resultArea.innerHTML += `<p>Selected ${documentFiles.length} documents.</p>`; 
       documentFiles.forEach(file => { 
         resultArea.innerHTML += `<p>- ${file.name}</p>`; 
       }); 
     } 
   }); 

   sendPromptBtn.addEventListener('click', async () => {
     const promptText = promptInput.value.trim();
     if (promptText || templateFile || documentFiles.length > 0) {
       resultArea.innerHTML += `<p><strong>You:</strong> ${promptText}</p>`;
       promptInput.value = '';

       const filesData = [];
       if (templateFile) {
         const templateContent = await readFileAsText(templateFile);
         filesData.push({ name: templateFile.name, content: templateContent });
       }
       for (const file of documentFiles) {
         const fileContent = await readFileAsText(file);
         filesData.push({ name: file.name, content: fileContent });
       }

       try {
         const response = await fetch('/ask-gemini', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ prompt: promptText, filesData }),
         });
         const data = await response.json();
         resultArea.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
       } catch (error) {
         console.error('Error sending prompt:', error);
         resultArea.innerHTML += `<p><strong>Error:</strong> Could not get a response.</p>`;
       }
     }
   }); 

   processBtn.addEventListener('click', async () => {
     sendPromptBtn.click();
   }); 

   exportBtn.addEventListener('click', () => { 
     // Add logic to export results as PDF, Excel, or Word 
     alert('Exporting results...'); 
   });

   function startListening() {
     const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
     recognition.lang = 'en-US';
     recognition.interimResults = false;

     recognition.onresult = function(event) {
       const speechToText = event.results[0][0].transcript.toLowerCase();
       outputText.value = speechToText;
       handleVoiceCommand(speechToText);
     };

     recognition.start();
   }

   voiceToTextBtn.addEventListener('click', startListening);

   function handleVoiceCommand(text) {
     if (text.includes("select folder")) {
       folderUpload.click();
     } else if (text.includes("select file")) {
       templateUpload.click();
     } else if (text.includes("process documents")) {
       processBtn.click();
     } else if (text.includes("export")) {
       exportBtn.click();
     } else if (text.includes("clear")) {
       outputText.value = "";
     } else {
       promptInput.value = text;
       sendPromptBtn.click();
     }
   }

   function readFileAsText(file) {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => resolve(reader.result);
       reader.onerror = reject;
       reader.readAsText(file);
     });
   } 
 });
