import { Test, TestingModule } from '@nestjs/testing';
import { StarsController } from './stars.controller';

describe('StarsController', () => {
  let controller: StarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StarsController],
    }).compile();

    controller = module.get<StarsController>(StarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
