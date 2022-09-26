import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from 'src/user/decorators/user.decorator';
import { HomeResponseDto } from './dto/home.dto';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  propertyType?: PropertyType;
}

export const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  propertyType: true,
  number_of_bathrooms: true,
  number_of_bedrooms: true,
};

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filter,
    });

    if (!homes.length) throw new NotFoundException();

    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async getHomeById(homeId: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id: homeId,
      },
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    if (!home) throw new NotFoundException();

    return new HomeResponseDto(home);
  }

  async createHome(
    {
      address,
      numberOfBathrooms,
      numberOfBedrooms,
      city,
      images,
      price,
      propertyType,
    }: CreateHomeParams,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        city,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        price,
        propertyType,
        images: {
          createMany: {
            data: images,
          },
        },
        realtor_id: userId,
      },
    });

    return new HomeResponseDto(home);
  }

  async updateHomeById(id: number, data: UpdateHomeParams) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) throw new NotFoundException();

    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }
  async deleteHomeById(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) throw new NotFoundException();

    await this.prismaService.home.delete({
      where: { id },
    });
  }

  async getRealtorByHomeId(homeId: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id: homeId,
      },
      include: {
        realtor: true,
      },
    });

    if (!home) throw new NotFoundException();

    return home.realtor;
  }

  async inquire(buyer: UserInfo, homeId: number, message: string) {
    const realtor = await this.getRealtorByHomeId(homeId);

    return await this.prismaService.message.create({
      data: {
        realtor_id: realtor.id,
        buyer_id: buyer.id,
        home_id: homeId,
        message,
      },
    });
  }

  async getMessagesByHomeId(homeId: number) {
    return await this.prismaService.message.findMany({
      where: {
        home_id: homeId,
      },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }
}
