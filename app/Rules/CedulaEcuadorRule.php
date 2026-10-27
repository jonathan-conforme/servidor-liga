<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CedulaEcuadorRule implements ValidationRule
{
    /**
     * Ejecuta la regla de validación.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 1. Debe tener exactamente 10 dígitos numéricos
        if (!is_string($value) || !preg_match('/^[0-9]{10}$/', $value)) {
            $fail('El campo :attribute debe ser un número de cédula ecuatoriana válido de 10 dígitos.');
            return;
        }

        // 2. Validar el código de provincia (primeros dos dígitos)
        $provincia = (int) substr($value, 0, 2);
        if (($provincia < 1 || $provincia > 24) && $provincia !== 30) {
            $fail('El código de provincia de la cédula no es válido.');
            return;
        }

        // 3. Validar el tercer dígito (menor a 6 para cédulas de personas naturales)
        $tercerDigito = (int) $value[2];
        if ($tercerDigito >= 6) {
            $fail('El número de cédula ingresado no es válido.');
            return;
        }

        // 4. Algoritmo del décimo dígito (Módulo 10)
        $coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        $verificador = (int) $value[9];
        $suma = 0;

        for ($i = 0; $i < 9; $i++) {
            $valor = (int) $value[$i] * $coeficientes[$i];

            // Si el producto es mayor o igual a 10, se le resta 9
            if ($valor >= 10) {
                $valor -= 9;
            }

            $suma += $valor;
        }

        $totalIntermedio = $suma % 10;
        $digitoChequeo = ($totalIntermedio === 0) ? 0 : (10 - $totalIntermedio);

        // 5. Comparar el dígito verificador calculado con el real
        if ($digitoChequeo !== $verificador) {
            $fail('El número de cédula ingresado es inválido.');
        }
    }
}
