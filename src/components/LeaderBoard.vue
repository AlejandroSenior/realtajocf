<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ClassificationResponse, Team } from '@/interfaces/Classification.ts';

const clasificacion = ref<Team[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchClasificacion = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch('https://realtajoback-b8a4dxbxdkhtgham.westeurope-01.azurewebsites.net/api/v1/classification', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ClassificationResponse = await response.json();
    clasificacion.value = data.teams;
    console.log(data);
  } catch (err) {
    console.error('Error al obtener la clasificación:', err);
    error.value = 'Error al cargar la clasificación';
    // Datos de respaldo en caso de error
    clasificacion.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchClasificacion();
});
</script>

<template>
  <div class="my-10 mx-auto">
    <h2 class="text-center text-2xl font-bold text-secondary mb-5">Clasificación Liga 2025/26</h2>

    <div v-if="loading" class="text-center py-8">
      <p class="text-lg">Cargando clasificación...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500 text-lg">{{ error }}</p>
    </div>

    <table v-else-if="clasificacion.length > 0">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Equipo</th>
          <th>J</th>
          <th>G</th>
          <th>E</th>
          <th>P</th>
          <th>GF</th>
          <th>GC</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipo in clasificacion" :key="equipo.position">
          <td class="text-center">{{ equipo.position }}</td>
          <td>{{ equipo.team }}</td>
          <td>{{ equipo.matches.played }}</td>
          <td>{{ equipo.matches.wins }}</td>
          <td>{{ equipo.matches.draws }}</td>
          <td>{{ equipo.matches.losses }}</td>
          <td>{{ equipo.goals.for }}</td>
          <td>{{ equipo.goals.against }}</td>
          <td class="font-bold">{{ equipo.points }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else class="text-center py-8">
      <p class="text-lg">No hay datos de clasificación disponibles</p>
    </div>
  </div>
</template>

<style>
table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 20px;
  overflow: hidden;
}

th,
td {
  border: 2px solid #000;
}

th {
  background-color: var(--color-primary);
  color: white;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
}

td {
  padding: 10px 8px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

tr:last-child {
  border-bottom: 2px solid #000;
}

@media (max-width: 768px) {
  table {
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 8px 4px;
  }
}
</style>
