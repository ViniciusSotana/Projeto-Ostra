package dev.ostra.projetoostra.catalog.jewelrytype;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JewelryTypeDataInitializer {

    @Bean
    public CommandLineRunner loadJewelryTypes(JewelryTypeRepository jewelryTypeRepository) {
        return args -> {
            if (jewelryTypeRepository.count() == 0) {

                jewelryTypeRepository.save(new JewelryType("Anel", "Anéis de diversos materiais e estilos"));
                jewelryTypeRepository.save(new JewelryType("Colar", "Colares, gargantilhas e correntes"));
                jewelryTypeRepository.save(new JewelryType("Brinco", "Brincos de pressão, argola e tarraxa"));
                jewelryTypeRepository.save(new JewelryType("Pulseira", "Pulseiras e braceletes"));
                jewelryTypeRepository.save(new JewelryType("Tiara", "Tiaras diversas"));

                System.out.println("Tipos de joias padrão criados com sucesso!");
            }
        };
    }
}