
1. До

        public interface ITransferToAgentAsyncInitiationService {
        void transferToAgent(Integer fromAgent, ConferenceId conferenceId, Integer agentId, Boolean holdContact)
                throws AgentBusyException;
        
           void transferToAgentByLogin(Integer fromAgentId, ConferenceId conferenceId, String agentLogin, Boolean holdContact)
                 throws AgentNotFoundException, AgentBusyException;
        }
    
        public class TransferToAgentAsyncInitiationService implements ITransferToAgentAsyncInitiationService {
    
        @Override
        public void transferToAgent(
            Integer fromAgent, ConferenceId conferenceId, Integer agentId, Boolean holdContact
        ) throws AgentBusyException {
            AbstractConferenceInstance conference = conferenceInstanceService.getConference(conferenceId);
            ConferenceType conferenceType = conference.getConferenceType();
            Channel channel = channelConverter.convert(conferenceType);
            try {
                accountRoutingService.assignAgentToExistingContact(
                    conference.getContactSessionId(), conference.getAccountId(), fromAgent, agentId, channel);
            } catch (Exception e) {
                throw new AgentBusyException(e);
            }
        }
    
        @Override
        public void transferToAgentByLogin(Integer fromAgentId, ConferenceId conferenceId, String agentLogin,
                                           Boolean holdContact) throws AgentBusyException {
            AbstractConferenceInstance conference = conferenceInstanceService.getConference(conferenceId);
            ConferenceType conferenceType = conference.getConferenceType();
            Channel channel = channelConverter.convert(conferenceType);
            try {
                accountRoutingService.assignAgentToExistingContact(
                    conference.getContactSessionId(), conference.getAccountId(), fromAgentId, agentLogin, channel);
            } catch (Exception e) {
                throw new AgentBusyException(e);
            }
        }



После.

Из сигнатуры методов убрана возможность выбросить исключение. Методы возвращают true или false в зависимости от
результата действия.

        public interface ITransferToAgentAsyncInitiationService {
            boolean transferToAgent(Integer fromAgent, ConferenceId conferenceId, Integer agentId, Boolean holdContact);
        
            boolean transferToAgentByLogin(Integer fromAgentId, ConferenceId conferenceId, String agentLogin, Boolean holdContact);
        }
        public class TransferToAgentAsyncInitiationService implements ITransferToAgentAsyncInitiationService {
            public boolean transferToAgent(
            Integer fromAgent, ConferenceId conferenceId, Integer agentId, Boolean holdContact
            ) {
                AbstractConferenceInstance conference = conferenceInstanceService.getConference(conferenceId);
                ConferenceType conferenceType = conference.getConferenceType();
                Channel channel = channelConverter.convert(conferenceType);
                try {
                    accountRoutingService.assignAgentToExistingContact(
                    conference.getContactSessionId(), conference.getAccountId(), fromAgent, agentId, channel);
                    incrementTransferStartMetric(conferenceType);
                    return true;
                } catch (Exception e) {
                    return false;
            }
        }
        
            @Override
            public boolean transferToAgentByLogin(Integer fromAgentId, ConferenceId conferenceId, String agentLogin,
                                                  Boolean holdContact) {
                AbstractConferenceInstance conference = conferenceInstanceService.getConference(conferenceId);
                ConferenceType conferenceType = conference.getConferenceType();
                Channel channel = channelConverter.convert(conferenceType);
                try {
                    accountRoutingService.assignAgentToExistingContact(
                            conference.getContactSessionId(), conference.getAccountId(), fromAgentId, agentLogin, channel);
                    incrementTransferStartMetric(conferenceType);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }
        }

2.
До.

        export class Activity {
            id: number;
            name: string = '';
            description: string = '';
            folder: string = '';
            defaultActivity: boolean = false;
            hasEmptySkillCombinations: boolean = false;
            groupIds: number[] = [];
            channels: ChannelsValues[] = [ChannelsValues.VOICE_INBOUND];
            inbound: ActivityParametersInbound = new ActivityParametersInbound();
            mail: ActivityParametersEmail = new ActivityParametersEmail();
            salesforce: ActivityParametersSalesforce = new ActivityParametersSalesforce();
            lastUpdatedAt?: string;
            lastUpdatedBy?: BasicUserDTO;
            canExport: boolean = false;
            queues?: SimpleEntity[];
        }


После.

Все поля класс добавлены в конструктор, теперь их нужно задавать явно при ининциализации класса.

    export class Activity {
        constructor(
            private id: number,
            private description: string,
            private name: string,
            private folder: string,
            private defaultActivity: boolean,
            private hasEmptySkillCombinations: boolean,
            private groupIds: number[],
            private channels: ChannelsValues[],
            private inbound: ActivityParametersInbound,
            private mail: ActivityParametersEmail,
            private salesforce: ActivityParametersSalesforce,
            private canExport: boolean,
            private lastUpdatedAt?: string,
            private lastUpdatedBy?: BasicUserDTO,
            private queues?: SimpleEntity[]
    ) {}
    }

До

    export class ActivityParametersSalesforce implements ActivityParameters {
        maxAbrRingingTime: number = 120;
        maxRealWaitTime: number = 120; // Max real waiting time (s)
        calendarId: number = null;
        userIds: number[] = [];
        skillCombinations: ActivitySkillsCombination[] = [];
        wrapupParameters = new ActivityInboundWrapupParameters();
        enableAutomaticWrapup: boolean = false;
        automaticWrapupId: number = null;
        allowSelectOutboundInteractions: boolean = false;
        }

После.

Все поля класс добавлены в конструктор, теперь их нужно задавать явно при ининциализации класса.

    export class ActivityParametersSalesforce implements ActivityParameters {
        constructor (
            private maxAbrRingingTime: number,
            private maxRealWaitTime: number,
            public calendarId: number | null,
            public userIds: number[],
            public skillCombinations: ActivitySkillsCombination[],
            public wrapupParameters: ActivityInboundWrapupParameters,
            private enableAutomaticWrapup: boolean,
            private automaticWrapupId: number,
            private allowSelectOutboundInteractions: boolean,
        ) {}
    }

3.

До.

    export interface Card {
        rank: number | string;
        suit: Suits;
    }
    
    export type Suits = 'hearts' | 'spades' | 'diamonds' | 'clubs';


После.

Для достоинства карт добавлен конкретный тип вместо строки или числа.

    export interface Card {
    rank: Rank;
    suit: Suits;
    }

    export type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

    export type Suits = 'hearts' | 'spades' | 'diamonds' | 'clubs';


До.

    sendDigits(digits: string)

После.

Для методв отправки цифр во время звонка добавлен конкретный тип вместо более общего - строки.

    sendDigits(digits: DigitsFromDTMF)

    type DigitsFromDTMF = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0'