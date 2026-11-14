import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { TFunction } from 'i18next';

import { repos } from '@/database';
import { expensesCsv, healthCsv, petReportHtml } from '@/domain/exporters';
import { fmt } from '@/i18n';
import { usePreferences } from '@/store/preferences';

import { track } from './analytics';
import { clock } from './clock';
import { exportDir, writeExport } from './files';

/**
 * Premium exports (PDF/CSV). Files are generated on the device in a scratch cache
 * folder, handed to the Android share sheet (the user chooses the destination) and
 * deleted right after. Nothing is uploaded by PetCare.
 */
async function shareAndDelete(file: File, mimeType: string, title: string): Promise<void> {
  try {
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: title });
  } finally {
    try {
      if (file.exists) file.delete();
    } catch {
      // The export folder is also emptied at next start-up.
    }
  }
}

const stamp = () => clock.today();

export async function exportPetReport(petId: string, t: TFunction): Promise<void> {
  const r = repos();
  const pet = await r.pets.get(petId);
  if (!pet) return;
  const unit = usePreferences.getState().weightUnit;
  const [vaccinations, treatments, health, weights] = await Promise.all([r.vaccinations.forPet(petId), r.treatments.forPet(petId), r.health.forPet(petId), r.weights.forPet(petId)]);
  const html = petReportHtml(
    { pet, vaccinations, treatments, health, weights },
    {
      title: t('exports.reportTitle'),
      generatedOn: t('exports.generatedOn', { date: fmt.day(stamp(), { dateStyle: 'long' }) }),
      disclaimer: t('disclaimer.export'),
      profile: t('exports.profile'),
      vaccinations: t('lists.vaccination'),
      treatments: t('lists.treatment'),
      health: t('lists.health'),
      weights: t('lists.weight'),
      none: t('exports.none'),
      species: t(`species.${pet.species}`),
      fields: {
        field: t('exports.field'),
        value: t('exports.value'),
        species: t('fields.species'),
        breed: t('fields.breed'),
        birthDate: t('fields.birthDate'),
        color: t('fields.color'),
        identification: t('fields.identification'),
        adoptionDate: t('fields.adoptionDate'),
        name: t('fields.name'),
        administeredDate: t('fields.administeredDate'),
        nextDueDate: t('fields.nextDueDate'),
        vet: t('fields.vet'),
        instructions: t('fields.instructions'),
        startDate: t('fields.startDate'),
        endDate: t('fields.endDate'),
        prescriber: t('fields.prescriber'),
        date: t('fields.date'),
        reason: t('fields.reason'),
        diagnosis: t('fields.diagnosis'),
        weight: t('fields.weight'),
      },
      formatDate: (d) => (d ? fmt.day(d) : ''),
      formatWeight: (kg) => fmt.weight(kg, unit),
    },
  );
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  // Move the PDF into our scratch folder so it is cleaned up with the other exports.
  const tmp = new File(uri);
  const target = new File(exportDir(), `petcare-${safe(pet.name)}-${stamp()}.pdf`);
  if (target.exists) target.delete();
  await tmp.move(target);
  track('export_created', { format: 'pdf' });
  await shareAndDelete(target, 'application/pdf', t('exports.petReport'));
}

export async function exportExpensesCsv(t: TFunction, from?: string, to?: string): Promise<void> {
  const r = repos();
  const [expenses, pets] = await Promise.all([from && to ? r.expenses.between(from, to) : r.expenses.all(), r.pets.listAll()]);
  const csv = expensesCsv(expenses, pets, {
    header: [t('fields.date'), t('fields.pet'), t('fields.category'), t('fields.amount'), t('fields.currency'), t('fields.notes')],
    category: (c) => t(`options.expenseCategory.${c}`),
  });
  track('export_created', { format: 'csv_expenses' });
  await shareAndDelete(writeExport(`petcare-expenses-${stamp()}.csv`, csv), 'text/csv', t('exports.expensesCsv'));
}

export async function exportHealthCsv(petId: string, t: TFunction): Promise<void> {
  const r = repos();
  const pet = await r.pets.get(petId);
  const csv = healthCsv(await r.health.forPet(petId), [
    t('fields.date'),
    t('fields.reason'),
    t('fields.vet'),
    t('fields.clinic'),
    t('fields.diagnosis'),
    t('fields.exams'),
    t('fields.results'),
    t('fields.cost'),
    t('fields.currency'),
    t('fields.notes'),
  ]);
  track('export_created', { format: 'csv_health' });
  await shareAndDelete(writeExport(`petcare-health-${safe(pet?.name ?? 'pet')}-${stamp()}.csv`, csv), 'text/csv', t('exports.healthCsv'));
}

function safe(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) || 'pet'
  );
}
