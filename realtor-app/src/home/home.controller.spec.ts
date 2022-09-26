import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

const mockUser = {
  id: 53,
  name: 'Gabriel',
  email: 'gabriel@gmail.com',
  phone: '555 555 555',
};

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

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);

      await controller.getHomes('Toronto', '1500000');
      expect(mockGetHomes).toBeCalledWith({
        city: 'Toronto',
        price: {
          gte: 1500000,
        },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo = {
      name: 'Gabriel',
      id: 30,
      iat: 1,
      exp: 2,
    };

    const mockUpdateHomeParams = {
      address: '111 Yellow Str',
      numberOfBathrooms: 2,
      numberOfBedrooms: 2,
      city: 'Toronto',
      price: 3000,
      propertyType: PropertyType.RESIDENTIAL,
    };

    it("should throw unauth error if realtor didn't create home", async () => {
      expect(
        controller.updateHome(5, mockUpdateHomeParams, mockUserInfo),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update home if realtor id is valid', async () => {
      const mockUpdateHomeById = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHomeById);

      await controller.updateHome(1, mockUpdateHomeParams, {
        ...mockUserInfo,
        id: 53,
      });
      expect(mockUpdateHomeById).toBeCalled();
    });
  });
});
