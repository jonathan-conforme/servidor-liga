<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Categoria;

class CategoriaService
{
    public function index()
    {
        return Categoria::latest()->paginate(10);
    }

    public function create(array $data)
    {
        return Categoria::create($data);
    }

    public function update(Categoria $categoria, array $data)
    {
        $categoria->update($data);
        return $categoria;
    }

    public function delete(Categoria $categoria)
    {
        $categoria->delete();
    }
}
