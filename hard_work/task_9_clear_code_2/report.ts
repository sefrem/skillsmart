
// Здравствуйте. Странно, но с этим заданием немного не задалось. Перерыл рабочий проект и еще несколько сервисов других
// команд, наскреб только 2 из 5 примеров.

// 1. Методы, которые используются только в тесте
// Не нашел таких в проекте.


// 2. Цепочки методов
// Тоже не нашел длинных, максимум - 1-2 шага. Кажется, это вполне оправдано.


// 3. У метода слишком большой список параметров.
// Разбил метод на 2, отвечающих за свою часть финального объекта,
// количество аргументов уменьшилось с 6 до 4.

// До
const filterParams = this.coldStatsFiltersService.getDependentFiltersToUpdate(
    filterModel,
    currentFilterIds,
    filterIds,
    dynamicConfig,
    config,
    timezone
);

getDependentFiltersToUpdate(
    filterModel: Partial<ColdStatsFiltersModel>,
    currentFilterIds: ColdStatsFilters[],
    newFilterIds: ColdStatsFilters[],
    dynamicConfig: FilterDynamicConfig<ColdStatsFilters, ColdStatsFiltersModel>,
    report: ReportConfig<unknown>,
    timezone: string
): Partial<ColdStatsFiltersModel> {
    const voiceOptions = getDblSelectItems(
        (dynamicConfig.queueIds as FilterFacadeOptions)?.options ||
        [
            (dynamicConfig.combinedQueueIds as FilterFacadeOptions)?.options?.find((group) => group.value === ColdStatsQueueGroups.VOICE),
        ].filter(Boolean)
    ).map((o) => o.value);
    const mailOptions = getDblSelectItems(
        (dynamicConfig.mailQueueIds as FilterFacadeOptions)?.options ||
        [
            (dynamicConfig.combinedQueueIds as FilterFacadeOptions)?.options?.find((group) => group.value === ColdStatsQueueGroups.MAIL),
        ].filter(Boolean)
    ).map((o) => o.value);

    const currentFilterSet = new Set(currentFilterIds);
    const filterDifferenceSet = new Set(LODASH.difference(newFilterIds, currentFilterIds));

    const combinedQueues = filterDifferenceSet.has(ColdStatsFilters.COMBINED_QUEUES)
        ? LODASH.uniq([...(filterModel[ColdStatsFilters.QUEUES] ?? []), ...(filterModel[ColdStatsFilters.MAIL_QUEUES] ?? [])])
        : null;
    const voiceQueues =
        currentFilterSet.has(ColdStatsFilters.COMBINED_QUEUES) && voiceOptions
            ? filterModel[ColdStatsFilters.COMBINED_QUEUES]?.filter((queue) => voiceOptions.includes(queue))
            : null;
    const mailQueues =
        currentFilterSet.has(ColdStatsFilters.COMBINED_QUEUES) && mailOptions
            ? filterModel[ColdStatsFilters.COMBINED_QUEUES]?.filter((queue) => mailOptions.includes(queue))
            : null;

    const timeslot = filterModel[ColdStatsFilters.TIMESLOT] ?? reportsTimeslotMap[report.id] ?? ColdStatsTimeSlotsValue.MINUTES15;
    const getDateRange = (
        filterName: ColdStatsFilters.PERIOD_DATE | ColdStatsFilters.RECEPTION_DATE | ColdStatsFilters.CLOSURE_DATE
    ): SearchFormDate =>
        currentFilterSet.has(filterName)
            ? ColdStatsTimeslotsUtils.parseDateRangeToTimeslot(filterModel[filterName], timeslot) ??
            ColdStatsTimeslotsUtils.getDefaultDateRange(timezone, timeslot)
            : null;

    return LODASH.pickBy(
        {
            [ColdStatsFilters.PERIOD_DATE]: getDateRange(ColdStatsFilters.PERIOD_DATE),
            [ColdStatsFilters.RECEPTION_DATE]: getDateRange(ColdStatsFilters.RECEPTION_DATE),
            [ColdStatsFilters.CLOSURE_DATE]: getDateRange(ColdStatsFilters.CLOSURE_DATE),
            [ColdStatsFilters.COMBINED_QUEUES]: combinedQueues,
            [ColdStatsFilters.QUEUES]: voiceQueues,
            [ColdStatsFilters.MAIL_QUEUES]: mailQueues,
        },
        (value) => DtoUtils.isNotEmpty(value) || (LODASH.isArray(value) && LODASH.isEmpty(value))
    );
}


// После
const filterParams = {
    ...this.coldStatsFiltersService.getDependentDateFiltersToUpdate(filterModel, currentFilterIds, config, timezone),
    ...this.coldStatsFiltersService.getDependentQueuesFiltersToUpdate(filterModel, currentFilterIds, filterIds, dynamicConfig),
};

getDependentDateFiltersToUpdate(
    filterModel: Partial<ColdStatsFiltersModel>,
    currentFilterIds: ColdStatsFilters[],
    report: ReportConfig<unknown>,
    timezone: string
): Partial<ColdStatsFiltersModel> {
    const currentFilterSet = new Set(currentFilterIds);
    const timeslot = filterModel[ColdStatsFilters.TIMESLOT] ?? reportsTimeslotMap[report.id] ?? ColdStatsTimeSlotsValue.MINUTES15;

    const getDateRange = (
        filterName: ColdStatsFilters.PERIOD_DATE | ColdStatsFilters.RECEPTION_DATE | ColdStatsFilters.CLOSURE_DATE
    ): SearchFormDate =>
        currentFilterSet.has(filterName)
            ? ColdStatsTimeslotsUtils.parseDateRangeToTimeslot(filterModel[filterName], timeslot) ??
            ColdStatsTimeslotsUtils.getDefaultDateRange(timezone, timeslot)
            : null;

    return LODASH.pickBy(
        {
            [ColdStatsFilters.PERIOD_DATE]: getDateRange(ColdStatsFilters.PERIOD_DATE),
            [ColdStatsFilters.RECEPTION_DATE]: getDateRange(ColdStatsFilters.RECEPTION_DATE),
            [ColdStatsFilters.CLOSURE_DATE]: getDateRange(ColdStatsFilters.CLOSURE_DATE),
        },
        (value) => DtoUtils.isNotEmpty(value) || (LODASH.isArray(value) && LODASH.isEmpty(value))
    );
}

getDependentQueuesFiltersToUpdate(
    filterModel: Partial<ColdStatsFiltersModel>,
    currentFilterIds: ColdStatsFilters[],
    newFilterIds: ColdStatsFilters[],
    dynamicConfig: FilterDynamicConfig<ColdStatsFilters, ColdStatsFiltersModel>
): Partial<ColdStatsFiltersModel> {
    const voiceOptions = getDblSelectItems(
        (dynamicConfig.queueIds as FilterFacadeOptions)?.options ||
        [
            (dynamicConfig.combinedQueueIds as FilterFacadeOptions)?.options?.find((group) => group.value === ColdStatsQueueGroups.VOICE),
        ].filter(Boolean)
    ).map((o) => o.value);
    const mailOptions = getDblSelectItems(
        (dynamicConfig.mailQueueIds as FilterFacadeOptions)?.options ||
        [
            (dynamicConfig.combinedQueueIds as FilterFacadeOptions)?.options?.find((group) => group.value === ColdStatsQueueGroups.MAIL),
        ].filter(Boolean)
    ).map((o) => o.value);

    const currentFilterSet = new Set(currentFilterIds);
    const filterDifferenceSet = new Set(LODASH.difference(newFilterIds, currentFilterIds));

    const combinedQueues = filterDifferenceSet.has(ColdStatsFilters.COMBINED_QUEUES)
        ? LODASH.uniq([...(filterModel[ColdStatsFilters.QUEUES] ?? []), ...(filterModel[ColdStatsFilters.MAIL_QUEUES] ?? [])])
        : null;
    const voiceQueues =
        currentFilterSet.has(ColdStatsFilters.COMBINED_QUEUES) && voiceOptions
            ? filterModel[ColdStatsFilters.COMBINED_QUEUES]?.filter((queue) => voiceOptions.includes(queue))
            : null;
    const mailQueues =
        currentFilterSet.has(ColdStatsFilters.COMBINED_QUEUES) && mailOptions
            ? filterModel[ColdStatsFilters.COMBINED_QUEUES]?.filter((queue) => mailOptions.includes(queue))
            : null;

    return LODASH.pickBy(
        {
            [ColdStatsFilters.COMBINED_QUEUES]: combinedQueues,
            [ColdStatsFilters.QUEUES]: voiceQueues,
            [ColdStatsFilters.MAIL_QUEUES]: mailQueues,
        },
        (value) => DtoUtils.isNotEmpty(value) || (LODASH.isArray(value) && LODASH.isEmpty(value))
    );
}

// 4. Странные решения.
// Думаю, такие решения точно есть на уровне логики и на уровне системы в целом (2 и 3),
// на уровне кода я таких не нашел.


// 5. Чрезмерный результат
// Метода возвращает объект, который нигде не используется
// Убрал возвращаемое значение

// До
private updateNativeStatus(interaction: VoiceInteraction, newValue: ConferenceProgressStatusWs): VoiceInteraction {
    if (newValue !== interaction.nativeStatus) {
        interaction.nativeStatus = newValue;
        interaction.nativeStatusTimestamp = new Date();
    }
    return interaction;
}

// После
private updateNativeStatus(interaction: VoiceInteraction, newValue: ConferenceProgressStatusWs): void {
    if (newValue !== interaction.nativeStatus) {
    interaction.nativeStatus = newValue;
    interaction.nativeStatusTimestamp = new Date();
}
}
