// Generated once by the solver-backed puzzle generator (src/engine/generators.ts) with fixed
// seeds, then frozen as static content. Every puzzle is re-validated by the content tests.
import type { DeductionSpec, Difficulty } from '@/engine';

export const GENERATED_DEDUCTION: Record<'ordering' | 'grid' | 'knights' | 'code', { difficulty: Difficulty; spec: DeductionSpec }[]> = {
  "ordering": [
    {
      "difficulty": "easy",
      "spec": {
        "type": "ordering",
        "theme": "height",
        "people": [
          "Finn",
          "Hugo",
          "Raj",
          "Ines"
        ],
        "clues": [
          {
            "t": "notLast",
            "a": "Raj"
          },
          {
            "t": "notFirst",
            "a": "Ines"
          },
          {
            "t": "notLast",
            "a": "Hugo"
          },
          {
            "t": "above",
            "a": "Ines",
            "b": "Hugo"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 3
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "ordering",
        "theme": "queue",
        "people": [
          "Jon",
          "Ana",
          "Raj",
          "Ben"
        ],
        "clues": [
          {
            "t": "notFirst",
            "a": "Raj"
          },
          {
            "t": "above",
            "a": "Jon",
            "b": "Ben"
          },
          {
            "t": "above",
            "a": "Raj",
            "b": "Jon"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 2
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "ordering",
        "theme": "age",
        "people": [
          "Hugo",
          "Zoe",
          "Tom",
          "Gia"
        ],
        "clues": [
          {
            "t": "notFirst",
            "a": "Gia"
          },
          {
            "t": "last",
            "a": "Hugo"
          },
          {
            "t": "above",
            "a": "Gia",
            "b": "Tom"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 2
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "ordering",
        "theme": "age",
        "people": [
          "Kai",
          "Max",
          "Lea",
          "Finn"
        ],
        "clues": [
          {
            "t": "notLast",
            "a": "Kai"
          },
          {
            "t": "notLast",
            "a": "Lea"
          },
          {
            "t": "notFirst",
            "a": "Max"
          },
          {
            "t": "above",
            "a": "Max",
            "b": "Kai"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 0
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "ordering",
        "theme": "height",
        "people": [
          "Eli",
          "Gia",
          "Lea",
          "Ben"
        ],
        "clues": [
          {
            "t": "last",
            "a": "Gia"
          },
          {
            "t": "first",
            "a": "Eli"
          },
          {
            "t": "above",
            "a": "Lea",
            "b": "Ben"
          }
        ],
        "ask": {
          "kind": "positionOf",
          "who": "Lea"
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "ordering",
        "theme": "height",
        "people": [
          "Eli",
          "Ines",
          "Uma",
          "Zoe"
        ],
        "clues": [
          {
            "t": "above",
            "a": "Eli",
            "b": "Ines"
          },
          {
            "t": "notLast",
            "a": "Uma"
          },
          {
            "t": "above",
            "a": "Ines",
            "b": "Uma"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 3
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "ordering",
        "theme": "height",
        "people": [
          "Lea",
          "Hugo",
          "Ben",
          "Dev"
        ],
        "clues": [
          {
            "t": "notFirst",
            "a": "Hugo"
          },
          {
            "t": "last",
            "a": "Lea"
          },
          {
            "t": "above",
            "a": "Hugo",
            "b": "Dev"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 1
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "ordering",
        "theme": "age",
        "people": [
          "Raj",
          "Jon",
          "Finn",
          "Cleo",
          "Hugo"
        ],
        "clues": [
          {
            "t": "last",
            "a": "Cleo"
          },
          {
            "t": "above",
            "a": "Finn",
            "b": "Raj"
          },
          {
            "t": "notFirst",
            "a": "Jon"
          },
          {
            "t": "adjacent",
            "a": "Hugo",
            "b": "Cleo"
          },
          {
            "t": "adjacent",
            "a": "Finn",
            "b": "Raj"
          }
        ],
        "ask": {
          "kind": "positionOf",
          "who": "Raj"
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "ordering",
        "theme": "queue",
        "people": [
          "Gia",
          "Ben",
          "Dev",
          "Zoe",
          "Kai"
        ],
        "clues": [
          {
            "t": "above",
            "a": "Ben",
            "b": "Dev"
          },
          {
            "t": "notLast",
            "a": "Zoe"
          },
          {
            "t": "notLast",
            "a": "Dev"
          },
          {
            "t": "adjacent",
            "a": "Zoe",
            "b": "Kai"
          },
          {
            "t": "above",
            "a": "Gia",
            "b": "Ben"
          }
        ],
        "ask": {
          "kind": "positionOf",
          "who": "Ben"
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "ordering",
        "theme": "queue",
        "people": [
          "Yara",
          "Ines",
          "Dev",
          "Kai",
          "Ben"
        ],
        "clues": [
          {
            "t": "notLast",
            "a": "Yara"
          },
          {
            "t": "notFirst",
            "a": "Ben"
          },
          {
            "t": "above",
            "a": "Dev",
            "b": "Kai"
          },
          {
            "t": "notFirst",
            "a": "Dev"
          },
          {
            "t": "adjacent",
            "a": "Yara",
            "b": "Kai"
          },
          {
            "t": "adjacent",
            "a": "Ines",
            "b": "Ben"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 4
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "ordering",
        "theme": "queue",
        "people": [
          "Cleo",
          "Jon",
          "Hugo",
          "Omar",
          "Tom"
        ],
        "clues": [
          {
            "t": "notFirst",
            "a": "Hugo"
          },
          {
            "t": "notFirst",
            "a": "Omar"
          },
          {
            "t": "adjacent",
            "a": "Jon",
            "b": "Cleo"
          },
          {
            "t": "adjacent",
            "a": "Tom",
            "b": "Hugo"
          },
          {
            "t": "last",
            "a": "Cleo"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 1
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "ordering",
        "theme": "race",
        "people": [
          "Ana",
          "Sara",
          "Max",
          "Uma",
          "Gia"
        ],
        "clues": [
          {
            "t": "directlyAbove",
            "a": "Sara",
            "b": "Gia"
          },
          {
            "t": "notFirst",
            "a": "Ana"
          },
          {
            "t": "above",
            "a": "Ana",
            "b": "Max"
          },
          {
            "t": "adjacent",
            "a": "Max",
            "b": "Ana"
          },
          {
            "t": "above",
            "a": "Ana",
            "b": "Uma"
          }
        ],
        "ask": {
          "kind": "positionOf",
          "who": "Max"
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "ordering",
        "theme": "height",
        "people": [
          "Ben",
          "Lea",
          "Gia",
          "Finn",
          "Ines"
        ],
        "clues": [
          {
            "t": "notLast",
            "a": "Ines"
          },
          {
            "t": "above",
            "a": "Lea",
            "b": "Ines"
          },
          {
            "t": "notFirst",
            "a": "Ben"
          },
          {
            "t": "adjacent",
            "a": "Gia",
            "b": "Lea"
          },
          {
            "t": "adjacent",
            "a": "Lea",
            "b": "Ben"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 2
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "ordering",
        "theme": "age",
        "people": [
          "Kai",
          "Gia",
          "Lea",
          "Ines",
          "Zoe"
        ],
        "clues": [
          {
            "t": "notFirst",
            "a": "Gia"
          },
          {
            "t": "directlyAbove",
            "a": "Gia",
            "b": "Lea"
          },
          {
            "t": "adjacent",
            "a": "Ines",
            "b": "Zoe"
          },
          {
            "t": "last",
            "a": "Ines"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 0
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "ordering",
        "theme": "queue",
        "people": [
          "Cleo",
          "Yara",
          "Ana",
          "Kai",
          "Ines"
        ],
        "clues": [
          {
            "t": "notAdjacent",
            "a": "Kai",
            "b": "Yara"
          },
          {
            "t": "between",
            "a": "Ana",
            "b": "Yara",
            "c": "Cleo"
          },
          {
            "t": "above",
            "a": "Kai",
            "b": "Ines"
          },
          {
            "t": "between",
            "a": "Kai",
            "b": "Cleo",
            "c": "Yara"
          },
          {
            "t": "between",
            "a": "Yara",
            "b": "Ines",
            "c": "Ana"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 0
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "ordering",
        "theme": "race",
        "people": [
          "Pia",
          "Tom",
          "Eli",
          "Yara",
          "Uma"
        ],
        "clues": [
          {
            "t": "between",
            "a": "Yara",
            "b": "Tom",
            "c": "Uma"
          },
          {
            "t": "notPosition",
            "a": "Uma",
            "pos": 1
          },
          {
            "t": "between",
            "a": "Tom",
            "b": "Eli",
            "c": "Pia"
          },
          {
            "t": "between",
            "a": "Uma",
            "b": "Tom",
            "c": "Pia"
          }
        ],
        "ask": {
          "kind": "positionOf",
          "who": "Uma"
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "ordering",
        "theme": "age",
        "people": [
          "Lea",
          "Cleo",
          "Jon",
          "Ana",
          "Uma"
        ],
        "clues": [
          {
            "t": "notAdjacent",
            "a": "Cleo",
            "b": "Ana"
          },
          {
            "t": "notPosition",
            "a": "Ana",
            "pos": 4
          },
          {
            "t": "notAdjacent",
            "a": "Cleo",
            "b": "Lea"
          },
          {
            "t": "directlyAbove",
            "a": "Lea",
            "b": "Ana"
          },
          {
            "t": "above",
            "a": "Uma",
            "b": "Lea"
          },
          {
            "t": "above",
            "a": "Cleo",
            "b": "Jon"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 4
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "ordering",
        "theme": "race",
        "people": [
          "Finn",
          "Max",
          "Jon",
          "Yara",
          "Sara"
        ],
        "clues": [
          {
            "t": "above",
            "a": "Yara",
            "b": "Finn"
          },
          {
            "t": "between",
            "a": "Yara",
            "b": "Max",
            "c": "Jon"
          },
          {
            "t": "notAdjacent",
            "a": "Jon",
            "b": "Yara"
          },
          {
            "t": "directlyAbove",
            "a": "Sara",
            "b": "Finn"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 2
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "ordering",
        "theme": "height",
        "people": [
          "Omar",
          "Max",
          "Jon",
          "Ben",
          "Tom"
        ],
        "clues": [
          {
            "t": "notAdjacent",
            "a": "Omar",
            "b": "Max"
          },
          {
            "t": "above",
            "a": "Ben",
            "b": "Omar"
          },
          {
            "t": "between",
            "a": "Ben",
            "b": "Jon",
            "c": "Tom"
          },
          {
            "t": "notFirst",
            "a": "Jon"
          },
          {
            "t": "between",
            "a": "Omar",
            "b": "Max",
            "c": "Ben"
          }
        ],
        "ask": {
          "kind": "at",
          "pos": 4
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "ordering",
        "theme": "race",
        "people": [
          "Tom",
          "Dev",
          "Pia",
          "Uma",
          "Kai"
        ],
        "clues": [
          {
            "t": "between",
            "a": "Kai",
            "b": "Tom",
            "c": "Pia"
          },
          {
            "t": "notPosition",
            "a": "Dev",
            "pos": 3
          },
          {
            "t": "notPosition",
            "a": "Kai",
            "pos": 1
          },
          {
            "t": "above",
            "a": "Kai",
            "b": "Dev"
          },
          {
            "t": "between",
            "a": "Tom",
            "b": "Uma",
            "c": "Kai"
          }
        ],
        "ask": {
          "kind": "positionOf",
          "who": "Dev"
        }
      }
    }
  ],
  "grid": [
    {
      "difficulty": "easy",
      "spec": {
        "type": "grid",
        "people": [
          "Eli",
          "Ines",
          "Cleo"
        ],
        "values": {
          "drink": [
            "water",
            "juice",
            "tea"
          ],
          "pet": [
            "cat",
            "dog",
            "parrot"
          ]
        },
        "clues": [
          {
            "t": "isNot",
            "who": "Cleo",
            "v": "drink.juice"
          },
          {
            "t": "notSame",
            "v1": "drink.water",
            "v2": "pet.dog"
          },
          {
            "t": "is",
            "who": "Ines",
            "v": "pet.dog"
          },
          {
            "t": "notSame",
            "v1": "drink.tea",
            "v2": "pet.cat"
          },
          {
            "t": "isNot",
            "who": "Cleo",
            "v": "drink.water"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "drink.water"
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "grid",
        "people": [
          "Ana",
          "Max",
          "Jon"
        ],
        "values": {
          "pet": [
            "fish",
            "cat",
            "dog"
          ],
          "drink": [
            "water",
            "juice",
            "coffee"
          ]
        },
        "clues": [
          {
            "t": "isNot",
            "who": "Ana",
            "v": "pet.cat"
          },
          {
            "t": "notSame",
            "v1": "drink.water",
            "v2": "pet.dog"
          },
          {
            "t": "is",
            "who": "Jon",
            "v": "pet.dog"
          },
          {
            "t": "is",
            "who": "Max",
            "v": "drink.juice"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "pet.fish"
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "grid",
        "people": [
          "Pia",
          "Uma",
          "Lea"
        ],
        "values": {
          "drink": [
            "coffee",
            "tea",
            "water"
          ],
          "house": [
            "blue",
            "red",
            "green"
          ]
        },
        "clues": [
          {
            "t": "is",
            "who": "Lea",
            "v": "drink.water"
          },
          {
            "t": "same",
            "v1": "house.green",
            "v2": "drink.water"
          },
          {
            "t": "isNot",
            "who": "Pia",
            "v": "house.red"
          },
          {
            "t": "same",
            "v1": "drink.tea",
            "v2": "house.red"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "drink.tea"
        }
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "grid",
        "people": [
          "Nora",
          "Max",
          "Kai"
        ],
        "values": {
          "instrument": [
            "violin",
            "piano",
            "guitar"
          ],
          "pet": [
            "parrot",
            "dog",
            "fish"
          ]
        },
        "clues": [
          {
            "t": "same",
            "v1": "pet.fish",
            "v2": "instrument.guitar"
          },
          {
            "t": "isNot",
            "who": "Nora",
            "v": "instrument.piano"
          },
          {
            "t": "same",
            "v1": "instrument.violin",
            "v2": "pet.parrot"
          },
          {
            "t": "isNot",
            "who": "Kai",
            "v": "pet.dog"
          },
          {
            "t": "isNot",
            "who": "Kai",
            "v": "instrument.violin"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "pet.fish"
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "grid",
        "people": [
          "Gia",
          "Cleo",
          "Sara"
        ],
        "values": {
          "instrument": [
            "piano",
            "guitar",
            "violin"
          ],
          "pet": [
            "fish",
            "parrot",
            "dog"
          ]
        },
        "clues": [
          {
            "t": "same",
            "v1": "pet.parrot",
            "v2": "instrument.guitar"
          },
          {
            "t": "notSame",
            "v1": "pet.fish",
            "v2": "instrument.violin"
          },
          {
            "t": "isNot",
            "who": "Cleo",
            "v": "pet.fish"
          },
          {
            "t": "isNot",
            "who": "Sara",
            "v": "pet.fish"
          },
          {
            "t": "isNot",
            "who": "Cleo",
            "v": "pet.dog"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "pet.dog"
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "grid",
        "people": [
          "Hugo",
          "Zoe",
          "Yara"
        ],
        "values": {
          "pet": [
            "fish",
            "cat",
            "parrot"
          ],
          "instrument": [
            "drums",
            "piano",
            "violin"
          ]
        },
        "clues": [
          {
            "t": "notSame",
            "v1": "instrument.piano",
            "v2": "pet.parrot"
          },
          {
            "t": "isNot",
            "who": "Hugo",
            "v": "instrument.violin"
          },
          {
            "t": "isNot",
            "who": "Zoe",
            "v": "pet.parrot"
          },
          {
            "t": "isNot",
            "who": "Zoe",
            "v": "pet.fish"
          },
          {
            "t": "same",
            "v1": "pet.fish",
            "v2": "instrument.drums"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "pet.parrot"
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "grid",
        "people": [
          "Gia",
          "Zoe",
          "Ana"
        ],
        "values": {
          "sport": [
            "chess",
            "cycling",
            "tennis"
          ],
          "instrument": [
            "guitar",
            "drums",
            "violin"
          ]
        },
        "clues": [
          {
            "t": "isNot",
            "who": "Zoe",
            "v": "sport.tennis"
          },
          {
            "t": "notSame",
            "v1": "instrument.guitar",
            "v2": "sport.tennis"
          },
          {
            "t": "notSame",
            "v1": "sport.tennis",
            "v2": "instrument.drums"
          },
          {
            "t": "is",
            "who": "Gia",
            "v": "instrument.guitar"
          },
          {
            "t": "notSame",
            "v1": "instrument.drums",
            "v2": "sport.chess"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "sport.tennis"
        }
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "grid",
        "people": [
          "Gia",
          "Kai",
          "Eli"
        ],
        "values": {
          "sport": [
            "tennis",
            "chess",
            "cycling"
          ],
          "house": [
            "blue",
            "yellow",
            "green"
          ]
        },
        "clues": [
          {
            "t": "same",
            "v1": "house.green",
            "v2": "sport.cycling"
          },
          {
            "t": "is",
            "who": "Kai",
            "v": "house.yellow"
          },
          {
            "t": "is",
            "who": "Eli",
            "v": "sport.cycling"
          },
          {
            "t": "notSame",
            "v1": "house.blue",
            "v2": "sport.chess"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "house.blue"
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "grid",
        "people": [
          "Kai",
          "Uma",
          "Ines",
          "Gia"
        ],
        "values": {
          "sport": [
            "swimming",
            "chess",
            "tennis",
            "cycling"
          ],
          "instrument": [
            "violin",
            "guitar",
            "drums",
            "piano"
          ]
        },
        "clues": [
          {
            "t": "notSame",
            "v1": "instrument.piano",
            "v2": "sport.swimming"
          },
          {
            "t": "same",
            "v1": "instrument.guitar",
            "v2": "sport.chess"
          },
          {
            "t": "isNot",
            "who": "Uma",
            "v": "instrument.violin"
          },
          {
            "t": "notSame",
            "v1": "instrument.piano",
            "v2": "sport.tennis"
          },
          {
            "t": "isNot",
            "who": "Ines",
            "v": "instrument.piano"
          },
          {
            "t": "isNot",
            "who": "Ines",
            "v": "instrument.violin"
          },
          {
            "t": "notSame",
            "v1": "sport.tennis",
            "v2": "instrument.violin"
          },
          {
            "t": "isNot",
            "who": "Uma",
            "v": "sport.cycling"
          },
          {
            "t": "isNot",
            "who": "Kai",
            "v": "sport.cycling"
          },
          {
            "t": "isNot",
            "who": "Ines",
            "v": "instrument.guitar"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "sport.chess"
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "grid",
        "people": [
          "Zoe",
          "Pia",
          "Finn",
          "Ines"
        ],
        "values": {
          "sport": [
            "tennis",
            "swimming",
            "chess",
            "cycling"
          ],
          "house": [
            "red",
            "green",
            "blue",
            "yellow"
          ]
        },
        "clues": [
          {
            "t": "isNot",
            "who": "Pia",
            "v": "house.red"
          },
          {
            "t": "notSame",
            "v1": "house.green",
            "v2": "sport.cycling"
          },
          {
            "t": "notSame",
            "v1": "house.red",
            "v2": "sport.cycling"
          },
          {
            "t": "same",
            "v1": "sport.chess",
            "v2": "house.blue"
          },
          {
            "t": "notSame",
            "v1": "sport.tennis",
            "v2": "house.green"
          },
          {
            "t": "isNot",
            "who": "Zoe",
            "v": "sport.cycling"
          },
          {
            "t": "is",
            "who": "Finn",
            "v": "sport.chess"
          },
          {
            "t": "isNot",
            "who": "Pia",
            "v": "house.yellow"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "sport.cycling"
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "grid",
        "people": [
          "Sara",
          "Ines",
          "Gia",
          "Raj"
        ],
        "values": {
          "sport": [
            "tennis",
            "chess",
            "swimming",
            "cycling"
          ],
          "drink": [
            "juice",
            "tea",
            "water",
            "coffee"
          ]
        },
        "clues": [
          {
            "t": "isNot",
            "who": "Gia",
            "v": "drink.tea"
          },
          {
            "t": "isNot",
            "who": "Gia",
            "v": "sport.tennis"
          },
          {
            "t": "same",
            "v1": "sport.cycling",
            "v2": "drink.coffee"
          },
          {
            "t": "same",
            "v1": "drink.water",
            "v2": "sport.swimming"
          },
          {
            "t": "isNot",
            "who": "Ines",
            "v": "drink.juice"
          },
          {
            "t": "same",
            "v1": "drink.tea",
            "v2": "sport.chess"
          },
          {
            "t": "is",
            "who": "Raj",
            "v": "sport.cycling"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "drink.coffee"
        }
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "grid",
        "people": [
          "Sara",
          "Raj",
          "Cleo",
          "Ben"
        ],
        "values": {
          "instrument": [
            "piano",
            "violin",
            "guitar",
            "drums"
          ],
          "house": [
            "yellow",
            "red",
            "green",
            "blue"
          ]
        },
        "clues": [
          {
            "t": "notSame",
            "v1": "house.red",
            "v2": "instrument.guitar"
          },
          {
            "t": "same",
            "v1": "house.yellow",
            "v2": "instrument.piano"
          },
          {
            "t": "notSame",
            "v1": "house.blue",
            "v2": "instrument.guitar"
          },
          {
            "t": "is",
            "who": "Raj",
            "v": "house.red"
          },
          {
            "t": "notSame",
            "v1": "house.blue",
            "v2": "instrument.violin"
          },
          {
            "t": "is",
            "who": "Sara",
            "v": "instrument.piano"
          },
          {
            "t": "isNot",
            "who": "Cleo",
            "v": "instrument.drums"
          }
        ],
        "ask": {
          "kind": "whoHas",
          "v": "instrument.guitar"
        }
      }
    }
  ],
  "knights": [
    {
      "difficulty": "easy",
      "spec": {
        "type": "knights",
        "people": [
          "Yara",
          "Finn"
        ],
        "statements": [
          {
            "by": "Yara",
            "says": {
              "t": "same",
              "x": "Finn",
              "y": "Yara"
            }
          },
          {
            "by": "Finn",
            "says": {
              "t": "atLeastOneLiar"
            }
          }
        ]
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "knights",
        "people": [
          "Uma",
          "Cleo"
        ],
        "statements": [
          {
            "by": "Uma",
            "says": {
              "t": "different",
              "x": "Cleo",
              "y": "Uma"
            }
          },
          {
            "by": "Cleo",
            "says": {
              "t": "exactlyLiars",
              "n": 1
            }
          }
        ]
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "knights",
        "people": [
          "Ben",
          "Raj"
        ],
        "statements": [
          {
            "by": "Ben",
            "says": {
              "t": "same",
              "x": "Raj",
              "y": "Ben"
            }
          },
          {
            "by": "Raj",
            "says": {
              "t": "truthful",
              "x": "Ben"
            }
          }
        ]
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "knights",
        "people": [
          "Yara",
          "Dev"
        ],
        "statements": [
          {
            "by": "Yara",
            "says": {
              "t": "oneOfLiar",
              "x": "Dev",
              "y": "Yara"
            }
          },
          {
            "by": "Dev",
            "says": {
              "t": "liar",
              "x": "Yara"
            }
          }
        ]
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "knights",
        "people": [
          "Kai",
          "Gia",
          "Cleo"
        ],
        "statements": [
          {
            "by": "Kai",
            "says": {
              "t": "exactlyLiars",
              "n": 1
            }
          },
          {
            "by": "Gia",
            "says": {
              "t": "same",
              "x": "Gia",
              "y": "Kai"
            }
          },
          {
            "by": "Cleo",
            "says": {
              "t": "atLeastOneLiar"
            }
          }
        ]
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "knights",
        "people": [
          "Ben",
          "Nora",
          "Hugo"
        ],
        "statements": [
          {
            "by": "Ben",
            "says": {
              "t": "same",
              "x": "Hugo",
              "y": "Ben"
            }
          },
          {
            "by": "Nora",
            "says": {
              "t": "atLeastOneLiar"
            }
          },
          {
            "by": "Hugo",
            "says": {
              "t": "truthful",
              "x": "Nora"
            }
          }
        ]
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "knights",
        "people": [
          "Jon",
          "Zoe",
          "Gia"
        ],
        "statements": [
          {
            "by": "Jon",
            "says": {
              "t": "oneOfLiar",
              "x": "Gia",
              "y": "Jon"
            }
          },
          {
            "by": "Zoe",
            "says": {
              "t": "oneOfLiar",
              "x": "Jon",
              "y": "Gia"
            }
          },
          {
            "by": "Gia",
            "says": {
              "t": "liar",
              "x": "Zoe"
            }
          }
        ]
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "knights",
        "people": [
          "Nora",
          "Lea",
          "Dev"
        ],
        "statements": [
          {
            "by": "Nora",
            "says": {
              "t": "bothLiars",
              "x": "Lea",
              "y": "Nora"
            }
          },
          {
            "by": "Lea",
            "says": {
              "t": "same",
              "x": "Lea",
              "y": "Dev"
            }
          },
          {
            "by": "Dev",
            "says": {
              "t": "atLeastOneLiar"
            }
          }
        ]
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "knights",
        "people": [
          "Pia",
          "Lea",
          "Gia"
        ],
        "statements": [
          {
            "by": "Pia",
            "says": {
              "t": "liar",
              "x": "Lea"
            }
          },
          {
            "by": "Lea",
            "says": {
              "t": "exactlyLiars",
              "n": 1
            }
          },
          {
            "by": "Gia",
            "says": {
              "t": "atLeastOneLiar"
            }
          }
        ]
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "knights",
        "people": [
          "Omar",
          "Gia",
          "Yara"
        ],
        "statements": [
          {
            "by": "Omar",
            "says": {
              "t": "truthful",
              "x": "Gia"
            }
          },
          {
            "by": "Gia",
            "says": {
              "t": "liar",
              "x": "Yara"
            }
          },
          {
            "by": "Yara",
            "says": {
              "t": "oneOfLiar",
              "x": "Gia",
              "y": "Yara"
            }
          }
        ]
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "knights",
        "people": [
          "Pia",
          "Gia",
          "Hugo"
        ],
        "statements": [
          {
            "by": "Pia",
            "says": {
              "t": "truthful",
              "x": "Hugo"
            }
          },
          {
            "by": "Gia",
            "says": {
              "t": "oneOfLiar",
              "x": "Pia",
              "y": "Hugo"
            }
          },
          {
            "by": "Hugo",
            "says": {
              "t": "different",
              "x": "Pia",
              "y": "Gia"
            }
          }
        ]
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "knights",
        "people": [
          "Ana",
          "Omar",
          "Kai"
        ],
        "statements": [
          {
            "by": "Ana",
            "says": {
              "t": "same",
              "x": "Kai",
              "y": "Omar"
            }
          },
          {
            "by": "Omar",
            "says": {
              "t": "same",
              "x": "Kai",
              "y": "Omar"
            }
          },
          {
            "by": "Kai",
            "says": {
              "t": "liar",
              "x": "Ana"
            }
          }
        ]
      }
    }
  ],
  "code": [
    {
      "difficulty": "easy",
      "spec": {
        "type": "code",
        "digits": 3,
        "clues": [
          {
            "guess": "258",
            "correct": 1,
            "misplaced": 1
          },
          {
            "guess": "851",
            "correct": 1,
            "misplaced": 0
          },
          {
            "guess": "742",
            "correct": 1,
            "misplaced": 1
          }
        ]
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "code",
        "digits": 3,
        "clues": [
          {
            "guess": "908",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "435",
            "correct": 1,
            "misplaced": 0
          },
          {
            "guess": "068",
            "correct": 0,
            "misplaced": 0
          },
          {
            "guess": "691",
            "correct": 1,
            "misplaced": 1
          }
        ]
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "code",
        "digits": 3,
        "clues": [
          {
            "guess": "893",
            "correct": 1,
            "misplaced": 0
          },
          {
            "guess": "067",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "469",
            "correct": 0,
            "misplaced": 2
          },
          {
            "guess": "509",
            "correct": 0,
            "misplaced": 2
          }
        ]
      }
    },
    {
      "difficulty": "easy",
      "spec": {
        "type": "code",
        "digits": 3,
        "clues": [
          {
            "guess": "967",
            "correct": 0,
            "misplaced": 2
          },
          {
            "guess": "724",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "647",
            "correct": 0,
            "misplaced": 2
          },
          {
            "guess": "850",
            "correct": 1,
            "misplaced": 0
          }
        ]
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "code",
        "digits": 3,
        "clues": [
          {
            "guess": "385",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "305",
            "correct": 1,
            "misplaced": 0
          },
          {
            "guess": "851",
            "correct": 1,
            "misplaced": 0
          },
          {
            "guess": "209",
            "correct": 1,
            "misplaced": 1
          }
        ]
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "code",
        "digits": 3,
        "clues": [
          {
            "guess": "827",
            "correct": 1,
            "misplaced": 0
          },
          {
            "guess": "584",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "249",
            "correct": 1,
            "misplaced": 1
          }
        ]
      }
    },
    {
      "difficulty": "medium",
      "spec": {
        "type": "code",
        "digits": 3,
        "clues": [
          {
            "guess": "361",
            "correct": 0,
            "misplaced": 0
          },
          {
            "guess": "702",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "582",
            "correct": 0,
            "misplaced": 0
          },
          {
            "guess": "348",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "965",
            "correct": 1,
            "misplaced": 0
          }
        ]
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "code",
        "digits": 4,
        "clues": [
          {
            "guess": "5301",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "9025",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "1843",
            "correct": 0,
            "misplaced": 2
          },
          {
            "guess": "7043",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "4759",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "6457",
            "correct": 2,
            "misplaced": 0
          }
        ]
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "code",
        "digits": 4,
        "clues": [
          {
            "guess": "4759",
            "correct": 2,
            "misplaced": 0
          },
          {
            "guess": "0852",
            "correct": 1,
            "misplaced": 1
          },
          {
            "guess": "6581",
            "correct": 1,
            "misplaced": 1
          },
          {
            "guess": "6472",
            "correct": 0,
            "misplaced": 1
          }
        ]
      }
    },
    {
      "difficulty": "hard",
      "spec": {
        "type": "code",
        "digits": 4,
        "clues": [
          {
            "guess": "6107",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "5291",
            "correct": 0,
            "misplaced": 2
          },
          {
            "guess": "5697",
            "correct": 1,
            "misplaced": 2
          },
          {
            "guess": "2034",
            "correct": 0,
            "misplaced": 1
          },
          {
            "guess": "7048",
            "correct": 0,
            "misplaced": 1
          }
        ]
      }
    }
  ]
};
