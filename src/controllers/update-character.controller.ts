import {
  Filter,
  repository
} from '@loopback/repository';
import {param, patch, requestBody} from '@loopback/rest';
import {Character, Weapon} from '../models';
import {ArmorRepository, CharacterRepository, SkillRepository, WeaponRepository} from '../repositories';
export class UpdateCharacterController {
  constructor(
    @repository(CharacterRepository)
    public characterRepository : CharacterRepository,
      //add following lines
  @repository(WeaponRepository)
  public weaponRepository : WeaponRepository,
  @repository(ArmorRepository)
  public armorRepository : ArmorRepository,
  @repository(SkillRepository)
  public skillRepository : SkillRepository,
  ) {}
  @patch('/updatecharacter/{id}/weapon', {
    responses: {
      '200': {
        description: 'update weapon',
        content: {'application/json': {schema: Weapon}},
      },
    },
  })
  async updateWeapon(
    @param.path.string('id') id: string,
    @requestBody() weapon: Weapon,
  ): Promise<Weapon> {
    //equip new weapon
    let char: Character = await this.characterRepository.findById(id);
    char.attack! += weapon.attack;
    char.defence! += weapon.defence;

    //unequip old weapon
    let filter: Filter<Weapon> = {where:{"characterId":id}};
    if((await this.weaponRepository.find(filter))[0] != undefined){
      let oldWeapon: Weapon = await this.characterRepository.weapon(id).get();
      char.attack! -= oldWeapon.attack;
      char.defence! -= oldWeapon.defence;
      await this.characterRepository.weapon(id).delete();
    }
    await this.characterRepository.updateById(id, char);
    return await this.characterRepository.weapon(id).create(weapon);
  }

}
