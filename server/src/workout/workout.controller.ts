import { Body, Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('workout')
@UseGuards(AuthGuard())
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  // userId와 duration에 따른 운동 기록 가져오기
  @Get()
  async getWorkouts(@Req() req:any , @Query('duration') duration: number) {
    return this.workoutService.findWorkoutsByUserAndDuration(req.user._id, duration);
  }

  @Post('/start_exercise')
    getRecord(@Body() body: { exercise: string, duration: number}, @Req() req:any): Promise<{ count: number; date: string }> {
        return this.workoutService.getRecord(req.user._id,body.exercise, body.duration);
    }
  
    // 운동 기록 생성 (end_exercise)
  @Post('/end_exercise')
  createRecord(@Body() body: { exercise: string, duration: number, count: number, date: string },
              @Req() req:any,
            ): Promise<{ message: string }> {
            return this.workoutService.createRecord(body.exercise, Number(body.duration), body.count, body.date, req.user._id);
          }
}
