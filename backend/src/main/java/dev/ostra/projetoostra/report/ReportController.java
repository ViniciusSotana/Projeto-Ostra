package dev.ostra.projetoostra.report;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping("/sellers/ranking")
    public ResponseEntity<byte[]> getSellerRankingReport() {
        return buildPdfResponse(service.generateSellerRankingPdf(), "ranking_vendedoras.pdf");
    }

    @GetMapping("/clients/top")
    public ResponseEntity<byte[]> getTopClientsReport() {
        return buildPdfResponse(service.generateTopClientsPdf(), "top_clientes.pdf");
    }

    @GetMapping("/cases/audit")
    public ResponseEntity<byte[]> getJewelryCaseAuditReport() {
        return buildPdfResponse(service.generateJewelryCaseAuditPdf(), "auditoria_maletas.pdf");
    }

    @GetMapping("/collections/performance")
    public ResponseEntity<byte[]> getCollectionPerformanceReport() {
        return buildPdfResponse(service.generateCollectionPerformancePdf(), "performance_colecoes.pdf");
    }

    @GetMapping("/sales/monthly")
    public ResponseEntity<byte[]> getMonthlySalesReport() {
        return buildPdfResponse(service.generateMonthlySalesPdf(), "historico_vendas_mensal.pdf");
    }

    @GetMapping("/jewelries/top")
    public ResponseEntity<byte[]> getTopJewelries() {
        return buildPdfResponse(service.generateTopJewelriesPdf(), "top_joias.pdf");
    }

    private ResponseEntity<byte[]> buildPdfResponse(byte[] pdfBytes, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", filename);
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}