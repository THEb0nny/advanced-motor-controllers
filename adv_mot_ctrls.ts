/**
* Motor controllers based OFDL Advanced Motor Controller Block module (algorithm part).
* Based 1.1 ver, 2023/09/27.
*/
//% block="AdvMotCtrls" weight=84 color=#02ab38 icon="\uf3fd"
namespace advmotctrls {

    let pwr: number;

    let syncVLeft: number;
    let syncVRight: number;
    let syncVLeftSign: number;
    let syncVRightSign: number;

    /*
    let ACC1_minPwr: number;
    let ACC1_maxPwr: number;
    let ACC1_accelDist: number;
    let ACC1_decelDist: number;
    let ACC1_totalDist: number;
    let ACC1_isNEG: number;
    */

    let ACC2_minPwr: number;
    let ACC2_maxPwr: number;
    let ACC2_accelDist: number;
    let ACC2_decelDist: number;
    let ACC2_totalDist: number;
    let ACC2_isNEG: number;

    interface MotorsPower {
        pwrLeft: number;
        pwrRight: number;
    }

    interface AccTwoEncReturn {
        pwrOut: number;
        isDone: boolean;
    }

    /**
        Конфигурация синхронизации моторов шассии.
        @param vLeft входное значение скорости левого мотора, eg. 50
        @param vRight входное значение скорости правого мотора, eg. 50
    **/
    //% blockId=SyncMotorsConfig
    //% block="config sync сhassis control vLeft = $vLeft|vRight = $vRight"
    export function SyncMotorsConfig(vLeft: number, vRight: number) {
        syncVLeft = vLeft;
        syncVRight = vRight;
        syncVLeftSign = Math.abs(vLeft + 1) - Math.abs(vLeft);
        syncVRightSign = Math.abs(vRight + 1) - Math.abs(vRight);
    }

    /**
        Посчитать ошибку синхронизации моторов шассии с использованием значений с энкодеров.
        Возвращает число ошибки для регулятора.
        @param eLeft входное значение энкодера левого мотора
        @param eRight входное значение энкодера правого мотора
    **/
    //% blockId=GetErrorSyncMotors
    //% block="get error sync chassis motors eLeft = $eLeft|eRight = $eRight"
    export function GetErrorSyncMotors(eLeft: number, eRight: number): number {
        return ((syncVRight * eLeft) - (syncVLeft * eRight));
    }
    
    /**
        Получить значения скоростей (мощности) для моторов шассии на основе управляющего воздействия, полученного от регулятора.
        Возвращает интерфейс скорости (мощности) левого и правого моторов.
        @param U входное значение управляющего воздействия от регулятора
    **/
    //% blockId=GetPwrSyncMotors
    //% block="config sync сhassis control U = $U"
    export function GetPwrSyncMotors(U: number): MotorsPower {
        const pLeft = syncVLeft - syncVRightSign * U;
        const pRight = syncVRight + syncVLeftSign * U;
        return {
            pwrLeft: pLeft,
            pwrRight: pRight
        };
    }

    export function GetErrorSyncMotorsInPwr(eLeft: number, eRight: number, vLeft: number, vRight: number): number {
        return ((vRight * eLeft) - (vLeft * eRight));
    }

    export function GetPwrSyncMotorsInPwr(U: number, vLeft: number, vRight: number) {
        const pLeft = vLeft - (Math.abs(vRight + 1) - Math.abs(vRight)) * U;
        const pRight = vRight + (Math.abs(vLeft + 1) - Math.abs(vLeft)) * U;
        return {
            pwrLeft: pLeft,
            pwrRight: pRight
        };
    }

    /*
    export function AccOneEncConfig(minPwr_in: number, maxPwr_in: number, accelDist_in: number, decelDist_in: number, totalDist_in: number) {
        ACC1_minPwr = Math.abs(minPwr_in);
        ACC1_maxPwr = Math.abs(maxPwr_in);
        ACC1_accelDist = accelDist_in;
        ACC1_decelDist = decelDist_in;
        ACC1_totalDist = totalDist_in;

        if (minPwr_in < 0) ACC1_isNEG = 1;
        else ACC1_isNEG = 0;
    }

    export function AccOneEnc(e1: number, pwrOut: number): boolean {
        let done: boolean;
        let currEnc = Math.abs(e1);
        if (currEnc >= ACC1_totalDist) {
            done = true;
        } else if (currEnc > ACC1_totalDist / 2) {
            if (ACC1_decelDist == 0) {
                pwr = ACC1_maxPwr;
            } else {
                pwr = (ACC1_maxPwr - ACC1_minPwr) / Math.pow(ACC1_decelDist, 2) * Math.pow(currEnc - ACC1_totalDist, 2) + ACC1_minPwr;
            }
            done = false;
        } else {
            if (ACC1_accelDist == 0) {
                pwr = ACC1_maxPwr;
            } else {
                pwr = (ACC1_maxPwr - ACC1_minPwr) / Math.pow(ACC1_accelDist, 2) * Math.pow(currEnc - 0, 2) + ACC1_minPwr;
            }
            done = false;
        }

        if (pwr < ACC1_minPwr) {
            pwr = ACC1_minPwr;
        } else if (pwr > ACC1_maxPwr) {
            pwr = ACC1_maxPwr;
        }

        if (ACC1_isNEG == 1) {
            pwrOut = 0 - pwr;
        } else {
            pwrOut = pwr;
        }
        return done;
    }
    */

    /**
       Конфигурация ускорения и замедления шассии двух моторов.
       @param minPwr входное значение скорости на старте, eg. 15
       @param maxPwr входное значение максимальной скорости, eg. 50
       @param accelDist значение дистанции ускорения, eg. 150
       @param decelDist значение дистанции замедления, eg. 150
       @param totalDist значение всей дистанции, eg. 500
    **/
    //% blockId=AccTwoEncConfig
    //% block="accel/deceleration config chassis control at minPwr = $minPwr|maxPwr = $maxPwr|accelDist = $accelDist|decelDist = $decelDist|totalDist = $totalDist"
    export function AccTwoEncConfig(minPwr: number, maxPwr: number, accelDist: number, decelDist: number, totalDist: number) {
        ACC2_minPwr = Math.abs(minPwr);
        ACC2_maxPwr = Math.abs(maxPwr);
        ACC2_accelDist = accelDist;
        ACC2_decelDist = decelDist;
        ACC2_totalDist = totalDist;
        if (minPwr < 0) ACC2_isNEG = 1;
        else ACC2_isNEG = 0;
    }

    /**
       Конфигурация ускорения и замедления двумя моторами.
       @param minPwr входное значение скорости на старте, eg. 15
       @param maxPwr входное значение максимальной скорости, eg. 50
       @param accelDist значение дистанции ускорения, eg. 150
       @param decelDist значение дистанции замедления, eg. 150
       @param totalDist значение всей дистанции, eg. 500
    **/
    //% blockId=AccTwoEnc
    //% block="accel/deceleration chassis control compute at encoder left = $eLeft|right = $eRight"
    export function AccTwoEnc(eLeft: number, eRight: number): AccTwoEncReturn {
        let done: boolean;
        let pwrOut: number;
        let currEnc = (Math.abs(eLeft) + Math.abs(eRight)) / 2;
        if (currEnc >= ACC2_totalDist) {
            done = true;
        } else if (currEnc > ACC2_totalDist / 2) {
            if (ACC2_decelDist == 0) {
                pwr = ACC2_maxPwr;
            } else {
                pwr = (ACC2_maxPwr - ACC2_minPwr) / Math.pow(ACC2_decelDist, 2) * Math.pow(currEnc - ACC2_totalDist, 2) + ACC2_minPwr;
            }
            done = false;
        } else {
            if (ACC2_accelDist == 0) {
                pwr = ACC2_maxPwr;
            } else {
                pwr = (ACC2_maxPwr - ACC2_minPwr) / Math.pow(ACC2_accelDist, 2) * Math.pow(currEnc - 0, 2) + ACC2_minPwr;
            }
            done = false;
        }

        if (pwr < ACC2_minPwr) {
            pwr = ACC2_minPwr;
        } else if (pwr > ACC2_maxPwr) {
            pwr = ACC2_maxPwr;
        }

        if (ACC2_isNEG == 1) {
            pwrOut = 0 - pwr;
        } else {
            pwrOut = pwr;
        }

        return {
            pwrOut: pwrOut,
            isDone: done
        };
    }

}