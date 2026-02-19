import { ReactInstance } from "react";

export const printComponent = (ref: React.RefObject<HTMLDivElement | null>, title: string = "Document") => {
    const content = ref.current;
    if (!content) return;

    const printWindow = window.open("", "", "width=900,height=800");
    if (!printWindow) return;

    // Clone all style tags and link tags from the current document
    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
        .map((node) => node.outerHTML)
        .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <base href="${window.location.origin}/" />
        ${styles}
        <style>
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0.5in; }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <script>
          // Wait for resources to load before printing
          window.onload = () => {
             setTimeout(() => {
              window.print();
              window.close();
             }, 500);
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
};
