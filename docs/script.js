document.addEventListener('DOMContentLoaded', () => { 
   const templateUpload = document.getElementById('template-upload'); 
   const folderUpload = document.getElementById('folder-upload'); 
   const resultArea = document.getElementById('result-area'); 
   const promptInput = document.getElementById('prompt-input'); 
   const sendPromptBtn = document.getElementById('send-prompt'); 
   const processBtn = document.querySelector('.primary-btn'); 
   const exportBtn = document.getElementById('export-btn'); 

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
     if (promptText) { 
       resultArea.innerHTML += `<p><strong>You:</strong> ${promptText}</p>`; 
       promptInput.value = ''; 
       try { 
         const response = await fetch('/api/chat', { 
           method: 'POST', 
           headers: { 
             'Content-Type': 'application/json', 
           }, 
           body: JSON.stringify({ prompt: promptText }), 
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
     if (!templateFile || documentFiles.length === 0) { 
       alert('Please select a template and a folder of documents.'); 
       return; 
     } 

     const formData = new FormData(); 
     formData.append('template', templateFile); 
     documentFiles.forEach(file => { 
       formData.append('documents', file); 
     }); 

     try { 
       resultArea.innerHTML += `<p>Processing documents...</p>`; 
       const response = await fetch('/api/process', { 
         method: 'POST', 
         body: formData, 
       }); 
       const data = await response.json(); 
       resultArea.innerHTML += `<p><strong>Server:</strong> ${data.message}</p>`; 
       // Add logic to display processing results 
     } catch (error) { 
       console.error('Error processing documents:', error); 
       resultArea.innerHTML += `<p><strong>Error:</strong> Could not process documents.</p>`; 
     } 
   }); 

   exportBtn.addEventListener('click', () => { 
     // Add logic to export results as PDF, Excel, or Word 
     alert('Exporting results...'); 
   }); 
 });
