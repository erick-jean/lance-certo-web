export type VehicleStatus = 'ANALYZING' | 'PURCHASED' | 'SOLD';
export type FuelType = 'FLEX' | 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
export type TransmissionType = 'MANUAL' | 'AUTOMATIC';
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK';
export type AuctionType = 'ONLINE' | 'IN_PERSON' | 'HYBRID';
export type VehicleDamageType = 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
export type ExpenseCategory =
  | 'DOCUMENTATION'
  | 'REPAIR'
  | 'AUCTION_FEE'
  | 'TRANSPORT'
  | 'INSPECTION'
  | 'DEBT'
  | 'REGULARIZATION'
  | 'PREPARATION_SALE'
  | 'OTHER';
export type ExpenseSource = 'SYSTEM' | 'USER' | 'PARTNER';

export type VehicleImage = {
  id: string;
  url: string;
};

export type VehicleEvaluation = {
  suggestedBid: string;
  estimatedProfit: string;
  estimatedExpenses: string;
  expenses: EvaluationExpense[];
};

export type EvaluationExpense = {
  id: string;
  evaluationId: string;
  category: ExpenseCategory;
  source: ExpenseSource;
  name: string;
  amount: string;
  isRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Vehicle = {
  id: string;
  userId: string;
  plate?: string;
  brand?: string;
  model?: string;
  version?: string;
  yearManufacture?: number;
  yearModel?: number;
  color?: string;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  type: VehicleType;
  mileage?: number;
  images: VehicleImage[];
  fipeCode?: string;
  fipeValue?: string;
  marketValue?: string;
  evaluation?: VehicleEvaluation;
  auctioneer?: string;
  auctionType?: AuctionType;
  sourceUrl?: string;
  eventDate?: string;
  city?: string;
  state?: string;
  yardAddress?: string;
  auctionInitialBid?: string;
  auctionCurrentBid?: string;
  purchasePrice?: string;
  purchasedAt?: string;
  soldPrice?: string;
  soldAt?: string;
  damageType: VehicleDamageType;
  status: VehicleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const vehicles: Vehicle[] = [
  {
    id: 'toyota-corolla-xei',
    userId: 'user-demo',
    plate: 'ABC-1234',
    brand: 'Toyota',
    model: 'Corolla',
    version: 'XEi',
    yearManufacture: 2021,
    yearModel: 2022,
    color: 'Prata',
    fuelType: 'FLEX',
    transmission: 'AUTOMATIC',
    type: 'CAR',
    mileage: 48200,
    images: [
      { id: 'corolla-1', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1100&q=80' },
      { id: 'corolla-2', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=80' },
      { id: 'corolla-3', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1100&q=80' },
      { id: 'corolla-4', url: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1100&q=80' },
    ],
    fipeCode: '002170-0',
    fipeValue: 'R$ 135.000',
    marketValue: 'R$ 128.000',
    evaluation: {
      suggestedBid: 'R$ 98.500',
      estimatedProfit: 'R$ 18.400',
      estimatedExpenses: 'R$ 7.800',
      expenses: [
        {
          id: 'expense-corolla-1',
          evaluationId: 'evaluation-corolla',
          category: 'REPAIR',
          source: 'SYSTEM',
          name: 'Reparo de funilaria leve',
          amount: 'R$ 3.200',
          isRequired: true,
          notes: 'Estimativa baseada nas fotos do lote.',
          createdAt: '2024-05-15T10:30:00.000Z',
          updatedAt: '2024-05-15T10:30:00.000Z',
        },
        {
          id: 'expense-corolla-2',
          evaluationId: 'evaluation-corolla',
          category: 'DOCUMENTATION',
          source: 'SYSTEM',
          name: 'Regularização e transferência',
          amount: 'R$ 1.850',
          isRequired: true,
          createdAt: '2024-05-15T10:30:00.000Z',
          updatedAt: '2024-05-15T10:30:00.000Z',
        },
        {
          id: 'expense-corolla-3',
          evaluationId: 'evaluation-corolla',
          category: 'TRANSPORT',
          source: 'USER',
          name: 'Guincho até oficina',
          amount: 'R$ 900',
          isRequired: false,
          createdAt: '2024-05-15T10:30:00.000Z',
          updatedAt: '2024-05-15T10:30:00.000Z',
        },
      ],
    },
    auctioneer: 'Sodré Santoro',
    auctionType: 'ONLINE',
    sourceUrl: 'https://www.sodresantoro.com.br',
    eventDate: '2024-05-20',
    city: 'São Paulo',
    state: 'SP',
    yardAddress: 'Av. dos Leilões, 1200 - São Paulo, SP',
    auctionInitialBid: 'R$ 72.000',
    auctionCurrentBid: 'R$ 81.500',
    damageType: 'LIGHT',
    status: 'ANALYZING',
    notes: 'Boa margem estimada para lance, considerando reparos leves e documentação regular.',
    createdAt: '2024-05-15T10:30:00.000Z',
    updatedAt: '2024-05-15T10:30:00.000Z',
  },
  {
    id: 'jeep-compass-longitude',
    userId: 'user-demo',
    plate: 'XYZ-9876',
    brand: 'Jeep',
    model: 'Compass',
    version: 'Longitude',
    yearManufacture: 2020,
    yearModel: 2021,
    color: 'Branco',
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    type: 'CAR',
    mileage: 76300,
    images: [
      { id: 'compass-1', url: 'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?auto=format&fit=crop&w=1100&q=80' },
      { id: 'compass-2', url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1100&q=80' },
      { id: 'compass-3', url: 'https://images.unsplash.com/photo-1549925862-990c3a4e10a5?auto=format&fit=crop&w=1100&q=80' },
      { id: 'compass-4', url: 'https://images.unsplash.com/photo-1518987048-93e29699e79a?auto=format&fit=crop&w=1100&q=80' },
    ],
    fipeCode: '017096-9',
    fipeValue: 'R$ 142.000',
    marketValue: 'R$ 136.000',
    evaluation: {
      suggestedBid: 'R$ 115.000',
      estimatedProfit: 'R$ 21.000',
      estimatedExpenses: 'R$ 9.500',
      expenses: [
        {
          id: 'expense-compass-1',
          evaluationId: 'evaluation-compass',
          category: 'AUCTION_FEE',
          source: 'SYSTEM',
          name: 'Comissão do leiloeiro',
          amount: 'R$ 5.750',
          isRequired: true,
          createdAt: '2024-05-10T14:00:00.000Z',
          updatedAt: '2024-05-10T14:00:00.000Z',
        },
        {
          id: 'expense-compass-2',
          evaluationId: 'evaluation-compass',
          category: 'REPAIR',
          source: 'PARTNER',
          name: 'Revisão mecânica preventiva',
          amount: 'R$ 2.600',
          isRequired: true,
          notes: 'Orçamento sugerido por oficina parceira.',
          createdAt: '2024-05-10T14:00:00.000Z',
          updatedAt: '2024-05-10T14:00:00.000Z',
        },
      ],
    },
    auctioneer: 'VIP Leilões',
    auctionType: 'HYBRID',
    sourceUrl: 'https://www.vipleiloes.com.br',
    eventDate: '2024-05-10',
    city: 'Rio de Janeiro',
    state: 'RJ',
    yardAddress: 'Rod. Presidente Dutra, km 180 - Rio de Janeiro, RJ',
    auctionInitialBid: 'R$ 90.000',
    auctionCurrentBid: 'R$ 115.000',
    purchasePrice: 'R$ 115.000',
    purchasedAt: '2024-05-10T14:00:00.000Z',
    damageType: 'MEDIUM',
    status: 'PURCHASED',
    notes: 'Veículo arrematado dentro da faixa recomendada, com lucro estimado após custos.',
    createdAt: '2024-05-09T09:10:00.000Z',
    updatedAt: '2024-05-10T14:00:00.000Z',
  },
  {
    id: 'vw-nivus-highline',
    userId: 'user-demo',
    plate: 'NIV-2023',
    brand: 'VW',
    model: 'Nivus',
    version: 'Highline',
    yearManufacture: 2023,
    yearModel: 2023,
    color: 'Branco',
    fuelType: 'FLEX',
    transmission: 'AUTOMATIC',
    type: 'CAR',
    mileage: 19300,
    images: [
      { id: 'nivus-1', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1100&q=80' },
      { id: 'nivus-2', url: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1100&q=80' },
      { id: 'nivus-3', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1100&q=80' },
      { id: 'nivus-4', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1100&q=80' },
    ],
    fipeCode: '005531-1',
    fipeValue: 'R$ 125.000',
    marketValue: 'R$ 121.000',
    evaluation: {
      suggestedBid: 'R$ 92.000',
      estimatedProfit: 'R$ 20.500',
      estimatedExpenses: 'R$ 6.300',
      expenses: [
        {
          id: 'expense-nivus-1',
          evaluationId: 'evaluation-nivus',
          category: 'REGULARIZATION',
          source: 'SYSTEM',
          name: 'Débitos e transferência',
          amount: 'R$ 1.600',
          isRequired: true,
          createdAt: '2024-05-18T12:40:00.000Z',
          updatedAt: '2024-05-18T12:40:00.000Z',
        },
        {
          id: 'expense-nivus-2',
          evaluationId: 'evaluation-nivus',
          category: 'PREPARATION_SALE',
          source: 'SYSTEM',
          name: 'Pintura de para-choque',
          amount: 'R$ 2.200',
          isRequired: false,
          createdAt: '2024-05-18T12:40:00.000Z',
          updatedAt: '2024-05-18T12:40:00.000Z',
        },
        {
          id: 'expense-nivus-3',
          evaluationId: 'evaluation-nivus',
          category: 'DEBT',
          source: 'SYSTEM',
          name: 'Taxas administrativas',
          amount: 'R$ 950',
          isRequired: true,
          createdAt: '2024-05-18T12:40:00.000Z',
          updatedAt: '2024-05-18T12:40:00.000Z',
        },
      ],
    },
    auctioneer: 'Copart Brasil',
    auctionType: 'ONLINE',
    sourceUrl: 'https://www.copart.com.br',
    eventDate: '2024-05-24',
    city: 'São Paulo',
    state: 'SP',
    yardAddress: 'Estrada Municipal, 450 - Itaquaquecetuba, SP',
    auctionInitialBid: 'R$ 68.000',
    auctionCurrentBid: 'R$ 74.000',
    damageType: 'LIGHT',
    status: 'ANALYZING',
    notes: 'Perfil conservador, bom potencial para revenda se o lance ficar abaixo do recomendado.',
    createdAt: '2024-05-18T12:40:00.000Z',
    updatedAt: '2024-05-18T12:40:00.000Z',
  },
];
