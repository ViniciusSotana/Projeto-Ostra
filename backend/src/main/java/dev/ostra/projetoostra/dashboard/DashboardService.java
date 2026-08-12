package dev.ostra.projetoostra.dashboard;

import dev.ostra.projetoostra.catalog.collection.JewelryCollectionRepository;
import dev.ostra.projetoostra.catalog.jewelry.Jewelry;
import dev.ostra.projetoostra.catalog.jewelry.JewelryRepository;
import dev.ostra.projetoostra.people.client.ClientRepository;
import dev.ostra.projetoostra.people.seller.SellerRepository;
import dev.ostra.projetoostra.sale.jewelrycase.JewelryCaseRepository;
import dev.ostra.projetoostra.sale.sale.Sale;
import dev.ostra.projetoostra.sale.sale.SaleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class DashboardService {

    private final JewelryRepository jewelryRepository;
    private final SaleRepository saleRepository;
    private final ClientRepository clientRepository;
    private final SellerRepository sellerRepository;
    private final JewelryCaseRepository jewelryCaseRepository;
    private final JewelryCollectionRepository collectionRepository;

    public DashboardService(
            JewelryRepository jewelryRepository,
            SaleRepository saleRepository,
            ClientRepository clientRepository,
            SellerRepository sellerRepository,
            JewelryCaseRepository jewelryCaseRepository,
            JewelryCollectionRepository collectionRepository) {
        this.jewelryRepository = jewelryRepository;
        this.saleRepository = saleRepository;
        this.clientRepository = clientRepository;
        this.sellerRepository = sellerRepository;
        this.jewelryCaseRepository = jewelryCaseRepository;
        this.collectionRepository = collectionRepository;
    }

    public DashboardResponseDTO getDashboardData() {
        List<Jewelry> allJewelries = jewelryRepository.findAll();
        List<Sale> allSales = saleRepository.findByStatusNot("CANCELADA");

        long totalJewelries = jewelryRepository.count();

        BigDecimal totalStockValue = allJewelries.stream()
                .map(j -> j.getSellingPrice().multiply(BigDecimal.valueOf(j.getStockQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        YearMonth currentMonth = YearMonth.now();
        BigDecimal salesCurrentMonth = allSales.stream()
                .filter(sale -> YearMonth.from(sale.getSaleDate()).equals(currentMonth))
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeClients = clientRepository.count();

        BigDecimal totalHistoricalSales = allSales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageTicket = BigDecimal.ZERO;
        if (!allSales.isEmpty()) {
            averageTicket = totalHistoricalSales.divide(BigDecimal.valueOf(allSales.size()), 2, RoundingMode.HALF_UP);
        }

        long activeSellers = sellerRepository.countByIsActiveTrue();
        long circulatingCases = jewelryCaseRepository.count();
        long totalCollections = collectionRepository.count();

        return new DashboardResponseDTO(
                totalJewelries,
                totalStockValue,
                salesCurrentMonth,
                activeClients,
                averageTicket,
                activeSellers,
                circulatingCases,
                totalCollections
        );
    }
}