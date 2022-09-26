import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { homeSelect, HomeService } from './home.service';

const mockImages = [
  {
    id: 1,
    url: 'src1',
  },
  {
    id: 2,
    url: 'src2',
  },
];

const mockHome = {
  id: 1,
  address: '2345 William Str',
  city: 'Toronto',
  price: 150000,
  property_type: PropertyType.RESIDENTIAL,
  image: 'myimage',
  number_of_bedrooms: 3,
  number_of_bathrooms: 2.5,
};

const mockGetHomes = [
  {
    ...mockHome,
    images: mockImages,
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockResolvedValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
              image: {
                createMany: jest.fn().mockReturnValue(mockImages),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Toronto',
      price: {
        gte: 1000000,
        lte: 1500000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });

    it('should throw not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: '111 Yellow Str',
      numberOfBathrooms: 2,
      numberOfBedrooms: 2,
      city: 'Toronto',
      price: 3000,
      propertyType: PropertyType.RESIDENTIAL,
      images: [{ url: 'src' }],
    };

    it('should call prisma home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: mockCreateHomeParams.address,
          city: mockCreateHomeParams.city,
          number_of_bathrooms: mockCreateHomeParams.numberOfBathrooms,
          number_of_bedrooms: mockCreateHomeParams.numberOfBedrooms,
          price: mockCreateHomeParams.price,
          propertyType: mockCreateHomeParams.propertyType,
          images: {
            createMany: {
              data: mockCreateHomeParams.images,
            },
          },
          realtor_id: 5,
        },
      });
    });
  });
});
