package dev.ostra.projetoostra.report;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import dev.ostra.projetoostra.catalog.collection.JewelryCollection;
import dev.ostra.projetoostra.catalog.collection.JewelryCollectionRepository;
import dev.ostra.projetoostra.catalog.jewelry.Jewelry;
import dev.ostra.projetoostra.catalog.jewelry.JewelryRepository;
import dev.ostra.projetoostra.people.client.Client;
import dev.ostra.projetoostra.people.client.ClientRepository;
import dev.ostra.projetoostra.people.seller.Seller;
import dev.ostra.projetoostra.people.seller.SellerRepository;
import dev.ostra.projetoostra.sale.jewelrycase.JewelryCase;
import dev.ostra.projetoostra.sale.jewelrycase.JewelryCaseRepository;
import dev.ostra.projetoostra.sale.sale.Sale;
import dev.ostra.projetoostra.sale.sale.SaleRepository;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final SellerRepository sellerRepository;
    private final ClientRepository clientRepository;
    private final SaleRepository saleRepository;
    private final JewelryCaseRepository jewelryCaseRepository;
    private final JewelryCollectionRepository collectionRepository;
    private final JewelryRepository jewelryRepository;

    public ReportService(
            SellerRepository sellerRepository,
            ClientRepository clientRepository,
            SaleRepository saleRepository,
            JewelryCaseRepository jewelryCaseRepository,
            JewelryCollectionRepository collectionRepository,
            JewelryRepository jewelryRepository) {
        this.sellerRepository = sellerRepository;
        this.clientRepository = clientRepository;
        this.saleRepository = saleRepository;
        this.jewelryCaseRepository = jewelryCaseRepository;
        this.collectionRepository = collectionRepository;
        this.jewelryRepository = jewelryRepository;
    }

    private final NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private final DateTimeFormatter monthYearFormatter = DateTimeFormatter.ofPattern("MM/yyyy");

    private final Color brandGold = new Color(168, 124, 39);
    private final Color darkText = new Color(33, 37, 41);
    private final Color lightDivider = new Color(235, 235, 235);

    public byte[] generateSellerRankingPdf() {
        List<Seller> sellers = sellerRepository.findAll().stream()
                .sorted(Comparator.comparing(Seller::getSoldValue).reversed())
                .toList();
        return buildPdf("Ranking de Vendedoras", "Acompanhe o desempenho das vendedoras", new float[]{1.5f, 5f, 3f, 3f},
                new String[]{"Posição", "Nome da Vendedora", "Total Vendido", "Comissão"},
                table -> {
                    int pos = 1;
                    for (Seller seller : sellers) {
                        addStyledCell(table, pos + "º", Element.ALIGN_CENTER);
                        addStyledCell(table, seller.getName(), Element.ALIGN_LEFT);
                        addStyledCell(table, currencyFormat.format(seller.getSoldValue()), Element.ALIGN_RIGHT);
                        addStyledCell(table, currencyFormat.format(seller.getCommission()), Element.ALIGN_RIGHT);
                        pos++;
                    }
                });
    }

    public byte[] generateTopClientsPdf() {
        List<Client> clients = clientRepository.findAll().stream()
                .sorted(Comparator.comparing(Client::getTotalSpent, Comparator.nullsLast(BigDecimal::compareTo)).reversed())
                .toList();
        return buildPdf("Top Clientes", "Clientes com maior volume de compras", new float[]{1.5f, 5f, 3.5f, 3.5f},
                new String[]{"Posição", "Nome do Cliente", "Telefone", "Total Comprado"},
                table -> {
                    int pos = 1;
                    for (Client client : clients) {
                        BigDecimal spent = client.getTotalSpent() != null ? client.getTotalSpent() : BigDecimal.ZERO;
                        addStyledCell(table, pos + "º", Element.ALIGN_CENTER);
                        addStyledCell(table, client.getName(), Element.ALIGN_LEFT);
                        addStyledCell(table, client.getPhone() != null ? client.getPhone() : "-", Element.ALIGN_CENTER);
                        addStyledCell(table, currencyFormat.format(spent), Element.ALIGN_RIGHT);
                        pos++;
                    }
                });
    }

    public byte[] generateJewelryCaseAuditPdf() {
        List<JewelryCase> cases = jewelryCaseRepository.findAll();
        return buildPdf("Auditoria de Maletas", "Controle de estoque em circulação", new float[]{2f, 4f, 2f, 3f},
                new String[]{"Código", "Vendedora Resp.", "Qtd. Itens", "Valor Total na Maleta"},
                table -> {
                    for (JewelryCase jCase : cases) {
                        int totalItems = jCase.getItems().stream().mapToInt(i -> i.getQuantity()).sum();
                        BigDecimal totalValue = jCase.getItems().stream()
                                .map(i -> i.getJewelry().getSellingPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                        String sellerName = jCase.getSeller() != null ? jCase.getSeller().getName() : "Sem Vendedora";

                        addStyledCell(table, jCase.getCode(), Element.ALIGN_CENTER);
                        addStyledCell(table, sellerName, Element.ALIGN_LEFT);
                        addStyledCell(table, String.valueOf(totalItems), Element.ALIGN_CENTER);
                        addStyledCell(table, currencyFormat.format(totalValue), Element.ALIGN_RIGHT);
                    }
                });
    }

    public byte[] generateCollectionPerformancePdf() {
        List<JewelryCollection> collections = collectionRepository.findAll();
        List<Jewelry> allJewelries = jewelryRepository.findAll();

        return buildPdf("Performance de Coleções", "Visão geral do peso das coleções no estoque", new float[]{4f, 2f, 2f, 3f},
                new String[]{"Nome da Coleção", "Modelos", "Qtd. Físicas", "Valor Potencial"},
                table -> {
                    for (JewelryCollection collection : collections) {
                        List<Jewelry> colJewelries = allJewelries.stream()
                                .filter(j -> j.getCollection() != null && j.getCollection().getId().equals(collection.getId()))
                                .toList();

                        int uniqueModels = colJewelries.size();
                        int totalStock = colJewelries.stream().mapToInt(Jewelry::getStockQuantity).sum();
                        BigDecimal totalPotential = colJewelries.stream()
                                .map(j -> j.getSellingPrice().multiply(BigDecimal.valueOf(j.getStockQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                        addStyledCell(table, collection.getName(), Element.ALIGN_LEFT);
                        addStyledCell(table, String.valueOf(uniqueModels), Element.ALIGN_CENTER);
                        addStyledCell(table, String.valueOf(totalStock), Element.ALIGN_CENTER);
                        addStyledCell(table, currencyFormat.format(totalPotential), Element.ALIGN_RIGHT);
                    }
                });
    }

    public byte[] generateMonthlySalesPdf() {
        List<Sale> allSales = saleRepository.findByStatusNot("CANCELADA");

        Map<YearMonth, List<Sale>> salesByMonth = allSales.stream()
                .collect(Collectors.groupingBy(sale -> YearMonth.from(sale.getSaleDate())));

        List<YearMonth> sortedMonths = salesByMonth.keySet().stream()
                .sorted(Comparator.reverseOrder())
                .toList();

        return buildPdf("Histórico de Vendas", "Agrupamento de faturamento por mês", new float[]{3f, 3f, 4f},
                new String[]{"Mês / Ano", "Quantidade de Vendas", "Faturamento Total"},
                table -> {
                    for (YearMonth month : sortedMonths) {
                        List<Sale> monthSales = salesByMonth.get(month);

                        int totalSalesCount = monthSales.size();
                        BigDecimal monthRevenue = monthSales.stream()
                                .map(Sale::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                        addStyledCell(table, month.format(monthYearFormatter), Element.ALIGN_CENTER);
                        addStyledCell(table, String.valueOf(totalSalesCount), Element.ALIGN_CENTER);
                        addStyledCell(table, currencyFormat.format(monthRevenue), Element.ALIGN_RIGHT);
                    }
                });
    }

    public byte[] generateTopJewelriesPdf() {
        List<Sale> allSales = saleRepository.findByStatusNot("CANCELADA");

        Map<Jewelry, Integer> jewelrySalesCount = allSales.stream()
                .flatMap(sale -> sale.getItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getJewelry(),
                        Collectors.summingInt(item -> item.getQuantity())
                ));

        List<Map.Entry<Jewelry, Integer>> topJewelries = jewelrySalesCount.entrySet().stream()
                .sorted(Map.Entry.<Jewelry, Integer>comparingByValue().reversed())
                .limit(20)
                .toList();

        return buildPdf("Top 20 Joias Mais Vendidas", "Os produtos com maior saída no histórico de vendas", new float[]{1.5f, 5f, 2.5f, 2.5f},
                new String[]{"Posição", "Nome / SKU", "Qtd. Vendida", "Estoque Atual"},
                table -> {
                    int pos = 1;
                    for (Map.Entry<Jewelry, Integer> entry : topJewelries) {
                        Jewelry jewelry = entry.getKey();
                        int qtySold = entry.getValue();

                        addStyledCell(table, pos + "º", Element.ALIGN_CENTER);
                        addStyledCell(table, jewelry.getSku() + " - " + jewelry.getName(), Element.ALIGN_LEFT);
                        addStyledCell(table, String.valueOf(qtySold), Element.ALIGN_CENTER);

                        addStyledCell(table, String.valueOf(jewelry.getStockQuantity()), Element.ALIGN_CENTER);
                        pos++;
                    }
                });
    }

    private interface TableFiller {
        void fill(PdfPTable table);
    }

    private byte[] buildPdf(String titleText, String subtitleText, float[] columnWidths, String[] columnHeaders, TableFiller tableFiller) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            addDocumentHeader(document, titleText, subtitleText);

            PdfPTable table = new PdfPTable(columnWidths.length);
            table.setWidthPercentage(100);
            table.setWidths(columnWidths);

            addTableHeader(table, columnHeaders);
            tableFiller.fill(table);

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF: " + titleText, e);
        }
    }

    private void addDocumentHeader(Document document, String titleText, String subtitleText) throws DocumentException {
        Font brandFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 12, Font.NORMAL, brandGold);
        Paragraph brand = new Paragraph("Projeto Ostra", brandFont);
        brand.setAlignment(Element.ALIGN_LEFT);
        brand.setSpacingAfter(20);
        document.add(brand);

        Font titleFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 24, Font.NORMAL, darkText);
        Paragraph title = new Paragraph(titleText, titleFont);
        title.setAlignment(Element.ALIGN_LEFT);

        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
        String dateStr = LocalDateTime.now().format(dateFormatter);
        Paragraph subtitle = new Paragraph(subtitleText + " (Gerado em: " + dateStr + ")", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_LEFT);
        subtitle.setSpacingAfter(30);

        document.add(title);
        document.add(subtitle);
    }

    private void addTableHeader(PdfPTable table, String... columnTitles) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkText);
        for (String title : columnTitles) {
            PdfPCell header = new PdfPCell(new Phrase(title, headerFont));
            header.setBackgroundColor(Color.WHITE);

            header.setBorder(Rectangle.BOTTOM);
            header.setBorderColor(lightDivider);
            header.setBorderWidth(1.5f);

            header.setPaddingTop(10);
            header.setPaddingBottom(10);
            header.setHorizontalAlignment(Element.ALIGN_LEFT);
            header.setVerticalAlignment(Element.ALIGN_MIDDLE);
            table.addCell(header);
        }
    }

    private void addStyledCell(PdfPTable table, String text, int horizontalAlignment) {
        Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkText);
        PdfPCell cell = new PdfPCell(new Phrase(text, cellFont));

        cell.setBackgroundColor(Color.WHITE);

        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(lightDivider);
        cell.setBorderWidth(0.5f);

        cell.setPaddingTop(12);
        cell.setPaddingBottom(12);

        cell.setHorizontalAlignment(horizontalAlignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        table.addCell(cell);
    }
}