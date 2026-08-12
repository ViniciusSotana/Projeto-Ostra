package dev.ostra.projetoostra.catalog.jewelrytype;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/jewelry-types")
public class JewelryTypeController {

    private final JewelryTypeService service;

    public JewelryTypeController(JewelryTypeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<JewelryTypeResponseDTO> create(@RequestBody @Valid JewelryTypeRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<JewelryTypeResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JewelryTypeResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JewelryTypeResponseDTO> update(@PathVariable UUID id, @RequestBody @Valid JewelryTypeRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}