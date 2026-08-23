'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trip, Section, Activity } from '@/types';
import {
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useAddStopActivity,
  useRemoveStopActivity,
} from '@/hooks/useSections';
import { mockActivities } from '@/lib/mockData';
import toast from 'react-hot-toast';
import {
  Layers,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  MapPin,
  ArrowRight,
  Sparkles,
  Tag,
  Clock,
  FileText,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface SectionBuilderProps {
  trip: Trip;
}

export default function SectionBuilder({ trip }: SectionBuilderProps) {
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();
  const addStopMutation = useAddStopActivity();
  const removeStopMutation = useRemoveStopActivity();

  // State for new section form
  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionStart, setNewSectionStart] = useState(trip.startDate.split('T')[0]);
  const [newSectionEnd, setNewSectionEnd] = useState(trip.endDate.split('T')[0]);
  const [newSectionBudget, setNewSectionBudget] = useState('500');

  // State for editing section
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editBudget, setEditBudget] = useState('');

  // State for adding activity modal / drawer
  const [activeSectionForActivity, setActiveSectionForActivity] = useState<Section | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState(mockActivities[0]?.id || '');
  const [activityDay, setActivityDay] = useState(1);
  const [activityExpense, setActivityExpense] = useState('');
  const [activityNotes, setActivityNotes] = useState('');

  const tripStartFormatted = format(new Date(trip.startDate), 'MMM d, yyyy');
  const tripEndFormatted = format(new Date(trip.endDate), 'MMM d, yyyy');
  const tripTotalDays = Math.max(1, differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1);

  const validateSectionDates = (startStr: string, endStr: string): boolean => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const tripS = new Date(trip.startDate);
    const tripE = new Date(trip.endDate);

    if (e < s) {
      toast.error('Section end date cannot be before start date.');
      return false;
    }
    if (s < tripS || e > tripE) {
      toast.error(`Section dates must fall within trip dates (${tripStartFormatted} – ${tripEndFormatted}).`);
      return false;
    }
    return true;
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) {
      toast.error('Section name is required.');
      return;
    }
    if (!validateSectionDates(newSectionStart, newSectionEnd)) return;

    try {
      await createSectionMutation.mutateAsync({
        tripId: trip.id,
        name: newSectionName.trim(),
        sectionStart: new Date(newSectionStart).toISOString(),
        sectionEnd: new Date(newSectionEnd).toISOString(),
        budget: parseFloat(newSectionBudget) || 0,
      });

      toast.success(`Section "${newSectionName}" added!`);
      setNewSectionName('');
      setShowNewSectionForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create section');
    }
  };

  const startEditSection = (section: Section) => {
    setEditingSectionId(section.id);
    setEditName(section.name);
    setEditStart(section.sectionStart.split('T')[0]);
    setEditEnd(section.sectionEnd.split('T')[0]);
    setEditBudget(String(section.budget));
  };

  const handleSaveSectionEdit = async (sectionId: string) => {
    if (!editName.trim()) {
      toast.error('Section name is required.');
      return;
    }
    if (!validateSectionDates(editStart, editEnd)) return;

    try {
      await updateSectionMutation.mutateAsync({
        id: sectionId,
        data: {
          name: editName.trim(),
          sectionStart: new Date(editStart).toISOString(),
          sectionEnd: new Date(editEnd).toISOString(),
          budget: parseFloat(editBudget) || 0,
        },
      });
      toast.success('Section updated successfully');
      setEditingSectionId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (confirm(`Delete section "${sectionName}" and all its activities?`)) {
      try {
        await deleteSectionMutation.mutateAsync({ sectionId, tripId: trip.id });
        toast.success('Section deleted');
      } catch {
        toast.error('Failed to delete section');
      }
    }
  };

  const handleOpenAddActivity = (section: Section) => {
    setActiveSectionForActivity(section);
    setSelectedActivityId(mockActivities[0]?.id || '');
    setActivityDay(1);
    setActivityExpense(String(mockActivities[0]?.estimatedCost || 50));
    setActivityNotes('');
  };

  const handleActivitySelectionChange = (actId: string) => {
    setSelectedActivityId(actId);
    const act = mockActivities.find((a) => a.id === actId);
    if (act) {
      setActivityExpense(String(act.estimatedCost));
    }
  };

  const handleAddStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSectionForActivity) return;

    try {
      await addStopMutation.mutateAsync({
        sectionId: activeSectionForActivity.id,
        data: {
          activityId: selectedActivityId,
          day: Number(activityDay) || 1,
          expense: parseFloat(activityExpense) || 0,
          notes: activityNotes.trim() || undefined,
        },
      });

      toast.success('Activity stop added to section!');
      setActiveSectionForActivity(null);
    } catch {
      toast.error('Failed to add activity stop');
    }
  };

  const handleDeleteStop = async (sectionId: string, stopId: string) => {
    try {
      await removeStopMutation.mutateAsync({ sectionId, stopId });
      toast.success('Activity removed');
    } catch {
      toast.error('Failed to remove activity');
    }
  };

  const sections = trip.sections || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6433]">
            <Layers className="h-4 w-4" />
            <span>Itinerary Chapters & Sections</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[#0F172A]">{trip.name}</h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {tripStartFormatted} – {tripEndFormatted} ({tripTotalDays} days total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/trips/${trip.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324] transition"
          >
            View Complete Itinerary
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.length === 0 && !showNewSectionForm && (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#ECE6DE] bg-white p-14 text-center">
            <Layers className="h-10 w-10 text-[#FF6433] mb-3" />
            <h3 className="text-base font-bold text-[#0F172A]">No chapters configured yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Break down your journey into chapters (e.g. &ldquo;Tokyo City Highlights&rdquo;, &ldquo;Kyoto Temple Tour&rdquo;).
            </p>
            <button
              onClick={() => setShowNewSectionForm(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF6433] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#E85324]"
            >
              <Plus className="h-4 w-4" />
              Add First Section
            </button>
          </div>
        )}

        {sections.map((section, idx) => {
          const isEditing = editingSectionId === section.id;
          const sectionStartFormatted = format(new Date(section.sectionStart), 'MMM d');
          const sectionEndFormatted = format(new Date(section.sectionEnd), 'MMM d, yyyy');
          const sectionDays = Math.max(1, differenceInDays(new Date(section.sectionEnd), new Date(section.sectionStart)) + 1);
          const stopActivities = section.activities || [];
          const actualSectionSpent = stopActivities.reduce((acc, act) => acc + (act.expense || 0), 0);

          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-3xl border border-[#ECE6DE] bg-white shadow-sm transition hover:border-slate-300"
            >
              {/* Section Header */}
              <div className="border-b border-[#ECE6DE] bg-[#FAF8F5] p-5 sm:p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-slate-700">Section Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-[#ECE6DE] px-3.5 py-2 text-xs text-slate-900 focus:border-[#FF6433] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">Budget ($)</label>
                        <input
                          type="number"
                          value={editBudget}
                          onChange={(e) => setEditBudget(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-[#ECE6DE] px-3.5 py-2 text-xs text-slate-900 focus:border-[#FF6433] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-slate-700">Start Date</label>
                        <input
                          type="date"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-[#ECE6DE] px-3.5 py-2 text-xs text-slate-900 focus:border-[#FF6433] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">End Date</label>
                        <input
                          type="date"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-[#ECE6DE] px-3.5 py-2 text-xs text-slate-900 focus:border-[#FF6433] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingSectionId(null)}
                        className="rounded-full border border-[#ECE6DE] bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveSectionEdit(section.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6433] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#E85324]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF3EE] text-xs font-black text-[#FF6433]">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-[#0F172A]">{section.name}</h3>
                        <p className="text-xs text-slate-500">
                          {sectionStartFormatted} – {sectionEndFormatted} · {sectionDays} {sectionDays === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Budget Badge */}
                      <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs shadow-xs border border-[#ECE6DE]">
                        <DollarSign className="h-3.5 w-3.5 text-[#FF6433]" />
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Budget: </span>
                          <span className="font-extrabold text-slate-800">${section.budget.toLocaleString()}</span>
                          <span className="text-slate-400 text-[10px]"> (${actualSectionSpent} spent)</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditSection(section)}
                          className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-slate-700 transition"
                          title="Edit Section"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id, section.name)}
                          className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Delete Section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stop Activities in Section */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#FF6433]" />
                    Scheduled Stops ({stopActivities.length})
                  </h4>
                  <button
                    onClick={() => handleOpenAddActivity(section)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6433]/30 bg-[#FEF3EE] px-3.5 py-1 text-xs font-bold text-[#FF6433] hover:bg-[#FDE7DE] transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Activity
                  </button>
                </div>

                {stopActivities.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {stopActivities.map((stop) => (
                      <div
                        key={stop.id}
                        className="group flex items-start justify-between rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-3.5 text-xs transition hover:bg-white hover:shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#FEF3EE] px-2 py-0.5 text-[10px] font-bold text-[#FF6433]">
                              Day {stop.day}
                            </span>
                            <span className="font-bold text-slate-900">
                              {stop.activity?.name || 'Custom Activity'}
                            </span>
                          </div>
                          {stop.notes && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                              &ldquo;{stop.notes}&rdquo;
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            {stop.activity?.category && (
                              <span className="rounded-full bg-slate-200 px-2 py-0.2 uppercase font-medium">
                                {stop.activity.category}
                              </span>
                            )}
                            <span className="font-bold text-emerald-700">
                              Cost: ${stop.expense}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteStop(section.id, stop.id)}
                          className="rounded-full p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Remove Activity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No activities assigned to this section yet. Click &ldquo;Add Activity&rdquo; above.
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Add New Section Inline Form */}
        {showNewSectionForm ? (
          <div className="rounded-3xl border-2 border-[#FF6433]/40 bg-white p-6 sm:p-8 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#FF6433]" />
                Add New Section
              </h3>
              <button
                onClick={() => setShowNewSectionForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Section Name *</label>
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="e.g. Kyoto Ancient Temples"
                    className="mt-1 w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#FF6433] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Allocated Budget ($)</label>
                  <input
                    type="number"
                    value={newSectionBudget}
                    onChange={(e) => setNewSectionBudget(e.target.value)}
                    placeholder="500"
                    className="mt-1 w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#FF6433] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={newSectionStart}
                    onChange={(e) => setNewSectionStart(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#FF6433] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={newSectionEnd}
                    onChange={(e) => setNewSectionEnd(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#FF6433] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewSectionForm(false)}
                  className="rounded-full border border-[#ECE6DE] px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#FF6433] px-6 py-2 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324]"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowNewSectionForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#ECE6DE] bg-white py-4 text-xs font-bold text-slate-700 hover:border-[#FF6433] hover:bg-[#FEF3EE]/40 hover:text-[#FF6433] transition"
          >
            <Plus className="h-4 w-4" />
            + Add Another Section
          </button>
        )}
      </div>

      {/* Modal for Adding Activity Stop */}
      {activeSectionForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-[#ECE6DE] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#0F172A]">
                  Add Activity to &ldquo;{activeSectionForActivity.name}&rdquo;
                </h3>
                <p className="text-xs text-slate-500">
                  Select an activity stop or customize details.
                </p>
              </div>
              <button
                onClick={() => setActiveSectionForActivity(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStopSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Choose Activity
                </label>
                <select
                  value={selectedActivityId}
                  onChange={(e) => handleActivitySelectionChange(e.target.value)}
                  className="w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-3 text-xs text-slate-900 focus:bg-white focus:border-[#FF6433] focus:outline-none"
                >
                  {mockActivities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name} ({act.category} · ${act.estimatedCost})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Day Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={tripTotalDays}
                    value={activityDay}
                    onChange={(e) => setActivityDay(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-3 text-xs text-slate-900 focus:bg-white focus:border-[#FF6433] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Expense Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={activityExpense}
                    onChange={(e) => setActivityExpense(e.target.value)}
                    className="w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-3 text-xs text-slate-900 focus:bg-white focus:border-[#FF6433] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Notes & Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  placeholder="e.g. Book early morning slot, bring walking shoes"
                  className="w-full rounded-2xl border border-[#ECE6DE] bg-[#FAF8F5] p-3 text-xs text-slate-900 focus:bg-white focus:border-[#FF6433] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSectionForActivity(null)}
                  className="rounded-full border border-[#ECE6DE] px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#FF6433] px-6 py-2 text-xs font-bold text-white shadow-md shadow-[#FF6433]/25 hover:bg-[#E85324]"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
