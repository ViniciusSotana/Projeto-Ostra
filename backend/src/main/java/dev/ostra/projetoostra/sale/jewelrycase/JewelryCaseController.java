package dev.ostra.projetoostra.sale.jewelrycase;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/jewelry-cases")
public class JewelryCaseController {

    private final JewelryCaseService service;

    public JewelryCaseController(JewelryCaseService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<JewelryCaseResponseDTO> create(@RequestBody @Valid JewelryCaseRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<JewelryCaseResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JewelryCaseResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JewelryCaseResponseDTO> update(@PathVariable UUID id, @RequestBody @Valid JewelryCaseRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}