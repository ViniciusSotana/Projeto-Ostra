package dev.ostra.projetoostra.dashboard;

import java.math.BigDecimal;

public record DashboardResponseDTO(
        long totalJewelries,
        BigDecimal totalStockValue,
        BigDecimal salesCurrentMonth,
        long activeClients,
        BigDecimal averageTicket,
        long activeSellers,
        long circulatingCases,
        long totalCollections
) {
}