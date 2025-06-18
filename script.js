
const markdownInput = document.getElementById('markdownInput');
const htmlPreview = document.getElementById('htmlPreview');
const previewHtmlButton = document.getElementById('previewHtmlButton');
const downloadPdfButton = document.getElementById('downloadPdfButton');
const loadingIndicator = document.getElementById('loadingIndicator');

const renderMarkdown = () => {
    const md = markdownInput.value.trim();
    htmlPreview.innerHTML = md ? marked.parse(md) : '<p style="color:#6b7280;">Your HTML preview will appear here.</p>';
};

previewHtmlButton.addEventListener('click', renderMarkdown);


downloadPdfButton.addEventListener('click', () => {
    const md = markdownInput.value.trim();
    if (!md) {
        htmlPreview.innerHTML = '<p style="color:#ef4444;">Please enter some Markdown content before downloading PDF.</p>';
        return;
    }

    loadingIndicator.classList.add('visible');

    // Create wrapper div for PDF content
    const contentForPdf = document.createElement('div');
    contentForPdf.innerHTML = marked.parse(md);

    // Styling for content wrapper
    Object.assign(contentForPdf.style, {
        width: '180mm',              // A4 width 210mm - 30mm total margin (15mm each side)
        minHeight: 'auto',
        margin: '0 auto',           // center horizontally
        padding: '15mm 15mm 20mm', // top, right/left, bottom padding
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12pt',
        lineHeight: '1.5',
        color: '#333',
        background: '#fff',
        overflow: 'hidden',
    });

    // Add CSS style block for page-break handling
    const style = document.createElement('style');
    style.textContent = `
        * {
            box-sizing: border-box;
        }
        h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            page-break-inside: avoid;
            margin-top: 1.5em;
            margin-bottom: 0.6em;
            font-weight: bold;
        }
        p, ul, ol, li, blockquote, table, pre {
            page-break-inside: avoid;
            margin-bottom: 1em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table, th, td {
            border: 1px solid #ddd;
            padding: 6px 8px;
        }
        pre, code {
            background-color: #f5f5f5;
            padding: 6px;
            font-family: Consolas, monospace;
            white-space: pre-wrap;
            word-break: break-word;
        }
        @media print {
            body {
                margin: 0;
            }
            div {
                page-break-after: auto;
            }
        }
    `;
    contentForPdf.appendChild(style);

    document.body.appendChild(contentForPdf);

    // Generate PDF with zero margin (we handle margin with padding inside contentForPdf)
    html2pdf()
        .set({
            margin: 10,
            filename: 'converted_document.pdf',
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(contentForPdf)
        .save()
        .then(() => {
            loadingIndicator.classList.remove('visible');
            document.body.removeChild(contentForPdf);
        })
        .catch(err => {
            loadingIndicator.classList.remove('visible');
            document.body.removeChild(contentForPdf);
            htmlPreview.innerHTML = '<p style="color:#ef4444;">Error generating PDF. Please try again.</p>';
            console.error(err);
        });
});




window.onload = renderMarkdown;
